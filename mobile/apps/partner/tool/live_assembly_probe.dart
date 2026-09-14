// ignore_for_file: avoid_print
//
// Живая проба пути очереди сборщика (найдено на совместном прогоне
// 2026-09-06): экран отдавал «Не удалось загрузить задания», а запрос не уходил
// в сеть вовсе. Гейт U T10.12 снимался на фейк-репозитории, поэтому настоящий
// вызов admin API в приложении не выполнялся ни разу.
//
// Это НЕ тест CI и не код приложения: нужен живой стенд и учётка сборщика,
// вывод идёт print'ом в консоль. Держится в `tool/` именно поэтому.
//
// Запуск (стенд поднят): cd mobile/apps/partner && dart run tool/live_assembly_probe.dart
import 'package:api_client/api_client.dart'
    show
        AdminCompleteAssemblyTask,
        AdminMarkAssemblyItem,
        AdminMarkAssemblyItemStatus,
        MedusaStoreApi;
import 'package:dio/dio.dart';

Future<void> main() async {
  final dio = Dio(BaseOptions(baseUrl: 'http://127.0.0.1:9000'));

  final login = await dio.post<Map<String, dynamic>>(
    '/auth/user/emailpass',
    data: {
      'email': 'picker.finishing@stroymarket.kz',
      'password': 'picker123456',
    },
  );
  final token = login.data!['token'] as String;
  dio.options.headers['Authorization'] = 'Bearer $token';
  print('вход: ok, токен ${token.substring(0, 12)}…');

  final api = MedusaStoreApi(dio);
  try {
    final res = await api.assembly.getAssemblyTasks(
      limit: 50,
      offset: 0,
      status: 'pending,picking,shortage',
    );
    print('заданий: ${res.assemblyTasks.length}, группа: ${res.group}');
    for (final t in res.assemblyTasks) {
      print('  заказ ${t.orderDisplayId} · ${t.categoryName} · ${t.status}');
    }
    if (res.assemblyTasks.isEmpty) {
      print('Открытых заданий нет — цикл отметок пропущен.');
      return;
    }

    // Полный цикл по первому заданию: взять → отметить позиции → закрыть.
    // Проверяет ВСЕ методы клиента, а не только чтение: у каждого своя модель
    // тела, и мина `.toJson()` могла сидеть в любом из них.
    final target = res.assemblyTasks.firstWhere(
      (t) => t.status == 'pending',
      orElse: () => res.assemblyTasks.first,
    );
    final task = await api.assembly.getAssemblyTaskById(id: target.id);
    final id = task.assemblyTask.id;
    print('беру задание заказа ${task.assemblyTask.orderDisplayId}');

    // «Взять в работу» только если задание ещё не взято: повторный вызов
    // бэкенд справедливо отбивает («picking to picking is not allowed»).
    final started = task.assemblyTask.status == 'pending'
        ? await api.assembly.postAssemblyTaskStart(id: id)
        : task;
    print('в работе: ${started.assemblyTask.status}');

    final items = started.assemblyTask.items;
    for (var i = 0; i < items.length; i++) {
      final item = items[i];
      // Последнюю позицию отмечаем частично — нехватка это рабочее состояние
      // склада, и путь у неё отдельный (набрано меньше требуемого).
      // Частичная отметка имеет смысл только когда позиций больше одной:
      // при количестве 1 «частично 0» — это нехватка, у неё свой статус.
      final last = i == items.length - 1 && items.length > 1;
      final short = last && item.quantity > 1;
      final missing = last && item.quantity <= 1;
      final marked = await api.assembly.postAssemblyTaskItemMark(
        id: id,
        itemId: item.id,
        body: AdminMarkAssemblyItem(
          status: missing
              ? AdminMarkAssemblyItemStatus.missing
              : short
              ? AdminMarkAssemblyItemStatus.partial
              : AdminMarkAssemblyItemStatus.picked,
          pickedQuantity: missing
              ? 0
              : (short ? item.quantity - 1 : item.quantity).toInt(),
        ),
      );
      print(
        '  ${item.title}: '
        '${missing
            ? "нехватка"
            : short
            ? "частично"
            : "набрано"} '
        '(${marked.assemblyTask.itemsMarked} из ${marked.assemblyTask.itemsTotal})',
      );
    }

    final done = await api.assembly.postAssemblyTaskComplete(
      id: id,
      body: const AdminCompleteAssemblyTask(note: 'Живая проба сборщика'),
    );
    print(
      'задание закрыто: ${done.assemblyTask.status}; по заказу закрыто '
      '${done.orderAssembly.tasksFinished} из ${done.orderAssembly.tasksTotal}',
    );
  } on DioException catch (e) {
    print('ОШИБКА HTTP ${e.response?.statusCode}: ${e.response?.data}');
    print('запрос: ${e.requestOptions.method} ${e.requestOptions.path}');
    print('тело: ${e.requestOptions.data}');
  } catch (e, s) {
    print('ОШИБКА: $e');
    print(s.toString().split('\n').take(12).join('\n'));
  }
}
