import 'package:api_client/api_client.dart'
    show
        AdminAssemblyTask,
        AdminAssemblyTaskItem,
        AdminCompleteAssemblyTask,
        AdminMarkAssemblyItem,
        AdminMarkAssemblyItemStatus,
        AdminOrderAssemblySummary,
        MedusaStoreApi;

import '../domain/assembly_item_status.dart';
import '../domain/assembly_queue.dart';
import '../domain/assembly_task.dart';
import '../domain/assembly_task_item.dart';
import '../domain/assembly_task_status.dart';
import '../domain/order_assembly_summary.dart';
import 'assembly_repository.dart';

/// Реализация [AssemblyRepository] поверх admin API `/admin/assembly-tasks`.
/// Единственное место приложения, где видны сгенерированные DTO: наружу
/// уходят только доменные модели.
class MedusaAssemblyRepository implements AssemblyRepository {
  MedusaAssemblyRepository(this._api);

  final MedusaStoreApi _api;

  @override
  Future<AssemblyQueue> loadQueue({
    List<AssemblyTaskStatus> statuses = const [],
    int limit = 50,
    int offset = 0,
  }) async {
    final response = await _api.assembly.getAssemblyTasks(
      limit: limit,
      offset: offset,
      // Роут принимает список через запятую (`status=pending,picking`).
      status: statuses.isEmpty
          ? null
          : statuses.map((status) => status.name).join(','),
    );
    return AssemblyQueue(
      tasks: response.assemblyTasks.map(_task).toList(),
      total: response.counts.total.toInt(),
      countsByStatus: {
        for (final entry in response.counts.byStatus.entries)
          AssemblyTaskStatus.parse(entry.key): entry.value.toInt(),
      },
      group: response.group,
    );
  }

  @override
  Future<AssemblyTask> loadTask(String id) async {
    final response = await _api.assembly.getAssemblyTaskById(id: id);
    return _task(response.assemblyTask);
  }

  @override
  Future<AssemblyTask> startTask(String id) async {
    final response = await _api.assembly.postAssemblyTaskStart(id: id);
    return _task(response.assemblyTask);
  }

  @override
  Future<AssemblyTask> markItem({
    required String taskId,
    required String itemId,
    required AssemblyItemStatus status,
    int? pickedQuantity,
    String? note,
  }) async {
    final response = await _api.assembly.postAssemblyTaskItemMark(
      id: taskId,
      itemId: itemId,
      body: AdminMarkAssemblyItem(
        status: _markStatus(status),
        // Количество нужно только частичной отметке: у «набрал» это всё
        // требуемое, у «нет» — ноль, и подставляет их сервер.
        pickedQuantity: status == AssemblyItemStatus.partial
            ? pickedQuantity
            : null,
        note: note,
      ),
    );
    return _task(response.assemblyTask);
  }

  @override
  Future<({AssemblyTask task, OrderAssemblySummary order})> completeTask(
    String id, {
    String? note,
  }) async {
    final response = await _api.assembly.postAssemblyTaskComplete(
      id: id,
      body: note == null ? null : AdminCompleteAssemblyTask(note: note),
    );
    return (
      task: _task(response.assemblyTask),
      order: _summary(response.orderAssembly),
    );
  }

  AdminMarkAssemblyItemStatus _markStatus(AssemblyItemStatus status) {
    switch (status) {
      case AssemblyItemStatus.picked:
        return AdminMarkAssemblyItemStatus.picked;
      case AssemblyItemStatus.partial:
        return AdminMarkAssemblyItemStatus.partial;
      case AssemblyItemStatus.missing:
        return AdminMarkAssemblyItemStatus.missing;
      case AssemblyItemStatus.pending:
        // Снять отметку нельзя — до сети такой вызов не доходит.
        throw ArgumentError('Assembly item cannot be marked back to pending');
    }
  }

  AssemblyTask _task(AdminAssemblyTask dto) {
    return AssemblyTask(
      id: dto.id,
      orderId: dto.orderId,
      orderDisplayId: dto.orderDisplayId?.toInt(),
      customerName: dto.customerName,
      categoryHandle: dto.categoryHandle,
      categoryName: dto.categoryName,
      status: AssemblyTaskStatus.parse(dto.status.name),
      itemsTotal: dto.itemsTotal.toInt(),
      itemsMarked: dto.itemsMarked.toInt(),
      itemsShortage: dto.itemsMissing.toInt(),
      items: dto.items.map(_item).toList(),
      note: dto.note,
    );
  }

  AssemblyTaskItem _item(AdminAssemblyTaskItem dto) {
    return AssemblyTaskItem(
      id: dto.id,
      orderItemId: dto.orderItemId,
      title: dto.title,
      sku: dto.sku,
      quantity: dto.quantity.toInt(),
      pickedQuantity: dto.pickedQuantity.toInt(),
      status: AssemblyItemStatus.parse(dto.status.name),
      note: dto.note,
    );
  }

  OrderAssemblySummary _summary(AdminOrderAssemblySummary dto) {
    return OrderAssemblySummary(
      tasksTotal: dto.tasksTotal.toInt(),
      tasksFinished: dto.tasksFinished.toInt(),
      isFinished: dto.isFinished,
      isAssembled: dto.isAssembled,
      hasShortage: dto.hasShortage,
    );
  }
}
