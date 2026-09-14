import '../domain/assembly_item_status.dart';
import '../domain/assembly_queue.dart';
import '../domain/assembly_task.dart';
import '../domain/assembly_task_status.dart';
import '../domain/order_assembly_summary.dart';

/// Доступ к заданиям сборки. Абстракция отделяет экраны от сгенерированного
/// клиента: контроллеры и виджеты знают только доменные модели, а тесты
/// подставляют фейк.
abstract interface class AssemblyRepository {
  /// Очередь заданий сборщика. Категорию сервер подставляет из учётки —
  /// клиент её не передаёт и передать не может. Пустой [statuses] — без
  /// фильтра по статусу.
  Future<AssemblyQueue> loadQueue({
    List<AssemblyTaskStatus> statuses,
    int limit,
    int offset,
  });

  /// Карточка задания с позициями.
  Future<AssemblyTask> loadTask(String id);

  /// Взять задание в работу (ожидает → собирается; из нехватки — вернуться).
  Future<AssemblyTask> startTask(String id);

  /// Отметка по одной позиции. В ответ приходит всё задание целиком — экран
  /// перерисовывается одним ответом, ничего не досчитывая.
  Future<AssemblyTask> markItem({
    required String taskId,
    required String itemId,
    required AssemblyItemStatus status,
    int? pickedQuantity,
    String? note,
  });

  /// Закрыть задание. Итог («собрано» / «нехватка») выводит сервер из отметок;
  /// вместе с заданием приходит агрегат по заказу.
  Future<({AssemblyTask task, OrderAssemblySummary order})> completeTask(
    String id, {
    String? note,
  });
}
