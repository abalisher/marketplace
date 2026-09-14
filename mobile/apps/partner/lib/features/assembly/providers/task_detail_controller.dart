import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/offline_error.dart';
import '../data/assembly_repository.dart';
import '../domain/assembly_item_status.dart';
import '../domain/assembly_task.dart';
import '../domain/order_assembly_summary.dart';
import '../domain/pending_mark.dart';
import '../marks_not_sent_exception.dart';
import '../pending_mark_rules.dart';
import 'assembly_repository_provider.dart';
import 'pending_marks_controller.dart';
import 'task_queue_controller.dart';

/// Одно задание сборки: что взять с полки, отметки по позициям и закрытие.
///
/// Очередь неотправленных отметок читается ОДИН раз при загрузке и дальше
/// обновляется точечно: подписка на неё перезапускала бы загрузку задания на
/// каждую отметку — то есть ровно там, где сети как раз может не быть.
class TaskDetailController extends FamilyAsyncNotifier<AssemblyTask, String> {
  @override
  Future<AssemblyTask> build(String taskId) async {
    final task = await _repository.loadTask(taskId);
    return _withPending(task);
  }

  AssemblyRepository get _repository => ref.read(assemblyRepositoryProvider);

  /// Взять задание в работу (или вернуться к нему после нехватки). Без сети
  /// действие не имеет смысла — отмечать всё равно будет нечего.
  Future<void> start() async {
    final task = await _repository.startTask(arg);
    state = AsyncData(_withPending(task));
    ref.invalidate(taskQueueControllerProvider);
  }

  /// Отметка по позиции. Возвращает `true`, если сети не было и отметка легла
  /// в очередь: экран об этом обязан сказать — сборщик должен понимать, что
  /// его работа не потерялась, но ещё не уехала.
  Future<bool> mark({
    required String itemId,
    required AssemblyItemStatus status,
    int? pickedQuantity,
  }) async {
    final task = state.valueOrNull;
    if (task == null) {
      return false;
    }
    try {
      final updated = await _repository.markItem(
        taskId: arg,
        itemId: itemId,
        status: status,
        pickedQuantity: pickedQuantity,
      );
      state = AsyncData(_withPending(updated));
      return false;
    } catch (error) {
      if (!isOfflineError(error)) {
        rethrow;
      }
      final mark = PendingMark(
        taskId: arg,
        itemId: itemId,
        status: status,
        pickedQuantity: _resolveQuantity(task, itemId, status, pickedQuantity),
        createdAt: DateTime.now(),
      );
      await ref.read(pendingMarksControllerProvider.notifier).enqueue(mark);
      state = AsyncData(applyPendingMarks(task, [mark]));
      return true;
    }
  }

  /// Закрывает задание. Сначала досылает отметки этого задания: без них сервер
  /// вывел бы итог по неполной картине. Не удалось дослать — [MarksNotSentException].
  Future<OrderAssemblySummary> complete() async {
    final pending = pendingMarksOf(_pendingQueue, arg);
    if (pending.isNotEmpty) {
      final result = await ref
          .read(pendingMarksControllerProvider.notifier)
          .flush();
      final left = pendingMarksOf(_pendingQueue, arg);
      if (result.stillOffline || left.isNotEmpty) {
        throw MarksNotSentException(left.length);
      }
    }

    final completed = await _repository.completeTask(arg);
    state = AsyncData(completed.task);
    ref.invalidate(taskQueueControllerProvider);
    return completed.order;
  }

  /// Перечитывает задание с сервера, сохраняя наложение неотправленных отметок.
  Future<void> reload() async {
    state = await AsyncValue.guard(() async {
      final task = await _repository.loadTask(arg);
      return _withPending(task);
    });
  }

  List<PendingMark> get _pendingQueue =>
      ref.read(pendingMarksControllerProvider).valueOrNull ?? const [];

  AssemblyTask _withPending(AssemblyTask task) =>
      applyPendingMarks(task, pendingMarksOf(_pendingQueue, arg));

  /// Сколько набрано по отметке, когда её кладут в очередь: у «набрал» это всё
  /// требуемое, у «нет в наличии» — ноль. На сервере это же правило применяет
  /// `resolveItemMark` — здесь оно нужно, только чтобы экран показал верное
  /// количество до отправки.
  int _resolveQuantity(
    AssemblyTask task,
    String itemId,
    AssemblyItemStatus status,
    int? pickedQuantity,
  ) {
    switch (status) {
      case AssemblyItemStatus.picked:
        return task.items.firstWhere((item) => item.id == itemId).quantity;
      case AssemblyItemStatus.partial:
        return pickedQuantity ?? 0;
      case AssemblyItemStatus.missing:
      case AssemblyItemStatus.pending:
        return 0;
    }
  }
}

/// Провайдер задания по его id.
final taskDetailControllerProvider =
    AsyncNotifierProvider.family<TaskDetailController, AssemblyTask, String>(
      TaskDetailController.new,
    );
