import 'package:dio/dio.dart';

import 'package:marketplace_partner/features/assembly/data/assembly_repository.dart';
import 'package:marketplace_partner/features/assembly/data/pending_mark_store.dart';
import 'package:marketplace_partner/features/assembly/domain/assembly_item_status.dart';
import 'package:marketplace_partner/features/assembly/domain/assembly_queue.dart';
import 'package:marketplace_partner/features/assembly/domain/assembly_task.dart';
import 'package:marketplace_partner/features/assembly/domain/assembly_task_item.dart';
import 'package:marketplace_partner/features/assembly/domain/assembly_task_status.dart';
import 'package:marketplace_partner/features/assembly/domain/order_assembly_summary.dart';
import 'package:marketplace_partner/features/assembly/domain/pending_mark.dart';

/// Обрыв связи — то, что репозиторий видит на складе без сети.
DioException offlineError() => DioException(
  requestOptions: RequestOptions(path: '/admin/assembly-tasks'),
  type: DioExceptionType.connectionError,
);

/// Отказ сервера (задание уже закрыли) — повтор его судьбу не изменит.
DioException serverError() => DioException(
  requestOptions: RequestOptions(path: '/admin/assembly-tasks'),
  type: DioExceptionType.badResponse,
  response: Response<dynamic>(
    requestOptions: RequestOptions(path: '/admin/assembly-tasks'),
    statusCode: 409,
  ),
);

AssemblyTaskItem taskItem(
  String id, {
  int quantity = 10,
  int picked = 0,
  AssemblyItemStatus status = AssemblyItemStatus.pending,
}) {
  return AssemblyTaskItem(
    id: id,
    orderItemId: 'oi_$id',
    title: 'Позиция $id',
    sku: 'SKU-$id',
    quantity: quantity,
    pickedQuantity: picked,
    status: status,
  );
}

AssemblyTask assemblyTask({
  String id = 'task_1',
  AssemblyTaskStatus status = AssemblyTaskStatus.picking,
  List<AssemblyTaskItem>? items,
}) {
  final list = items ?? [taskItem('i1'), taskItem('i2')];
  return AssemblyTask(
    id: id,
    orderId: 'order_1',
    orderDisplayId: 43,
    customerName: 'Мадина Ержанова',
    categoryHandle: 'finishing',
    categoryName: 'Отделочные материалы',
    status: status,
    itemsTotal: list.length,
    itemsMarked: list.where((item) => item.status.isMarked).length,
    itemsShortage: list.where((item) => item.status.isShortage).length,
    items: list,
  );
}

/// Фейк заданий сборки: отдаёт заданное задание, записывает вызовы и умеет
/// падать нужной ошибкой. Экраны и контроллеры тестируются на границе
/// [AssemblyRepository] — без сети и сгенерированных DTO.
class FakeAssemblyRepository implements AssemblyRepository {
  FakeAssemblyRepository({
    AssemblyTask? task,
    this.queue = const AssemblyQueue.empty(),
    this.queueError,
    this.markError,
    this.completeError,
  }) : task = task ?? assemblyTask();

  AssemblyTask task;
  AssemblyQueue queue;

  /// Ошибка, которую бросает соответствующий вызов (null — работает).
  Object? queueError;
  Object? markError;
  Object? completeError;

  /// Статусы, с которыми последний раз спрашивали очередь.
  List<AssemblyTaskStatus> queueStatuses = const [];

  /// Отметки, дошедшие до «сервера», в порядке отправки.
  final List<PendingMark> marks = [];
  int startCalls = 0;
  int completeCalls = 0;

  OrderAssemblySummary summary = const OrderAssemblySummary(
    tasksTotal: 2,
    tasksFinished: 1,
    isFinished: false,
    isAssembled: false,
    hasShortage: false,
  );

  @override
  Future<AssemblyQueue> loadQueue({
    List<AssemblyTaskStatus> statuses = const [],
    int limit = 50,
    int offset = 0,
  }) async {
    if (queueError != null) throw queueError!;
    queueStatuses = statuses;
    return queue;
  }

  @override
  Future<AssemblyTask> loadTask(String id) async => task;

  @override
  Future<AssemblyTask> startTask(String id) async {
    startCalls++;
    task = task.copyWith(status: AssemblyTaskStatus.picking);
    return task;
  }

  @override
  Future<AssemblyTask> markItem({
    required String taskId,
    required String itemId,
    required AssemblyItemStatus status,
    int? pickedQuantity,
    String? note,
  }) async {
    if (markError != null) throw markError!;
    marks.add(
      PendingMark(
        taskId: taskId,
        itemId: itemId,
        status: status,
        pickedQuantity: pickedQuantity ?? 0,
        createdAt: DateTime(2026, 9, 2),
      ),
    );
    final items = [
      for (final item in task.items)
        if (item.id == itemId)
          item.copyWith(
            status: status,
            pickedQuantity: status == AssemblyItemStatus.picked
                ? item.quantity
                : (pickedQuantity ?? 0),
          )
        else
          item,
    ];
    task = task.copyWith(
      items: items,
      itemsMarked: items.where((item) => item.status.isMarked).length,
      itemsShortage: items.where((item) => item.status.isShortage).length,
    );
    return task;
  }

  @override
  Future<({AssemblyTask task, OrderAssemblySummary order})> completeTask(
    String id, {
    String? note,
  }) async {
    if (completeError != null) throw completeError!;
    completeCalls++;
    task = task.copyWith(
      status: task.itemsShortage > 0
          ? AssemblyTaskStatus.shortage
          : AssemblyTaskStatus.assembled,
    );
    return (task: task, order: summary);
  }
}

/// Очередь отметок в памяти — для тестов.
class InMemoryPendingMarkStore implements PendingMarkStore {
  InMemoryPendingMarkStore([List<PendingMark>? initial])
    : _marks = [...?initial];

  List<PendingMark> _marks;

  @override
  Future<List<PendingMark>> read() async => [..._marks];

  @override
  Future<void> write(List<PendingMark> marks) async => _marks = [...marks];
}
