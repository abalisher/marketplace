import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/offline_error.dart';
import '../data/assembly_repository.dart';
import '../data/pending_mark_store.dart';
import '../domain/pending_mark.dart';
import '../pending_mark_rules.dart';
import 'assembly_repository_provider.dart';
import 'pending_mark_store_provider.dart';

/// Итог попытки отправить накопленные отметки: сколько уехало, сколько
/// отвергнуто сервером (задание успели закрыть — такая отметка не применится
/// уже никогда) и осталась ли очередь непустой из-за сети.
typedef PendingFlushResult = ({int sent, int rejected, bool stillOffline});

/// Очередь неотправленных отметок сборщика. Держит список в памяти и на
/// устройстве, отправляет его по требованию.
///
/// Почему очередь, а не «попробовать ещё раз»: склад бывает без сети, а
/// отметка — единственный след ручной работы у полки. Потерять её нельзя, и
/// переспрашивать сборщика после восстановления связи тоже нельзя — он уже
/// ушёл к следующей позиции.
class PendingMarksController extends AsyncNotifier<List<PendingMark>> {
  @override
  Future<List<PendingMark>> build() =>
      ref.read(pendingMarkStoreProvider).read();

  AssemblyRepository get _repository => ref.read(assemblyRepositoryProvider);
  PendingMarkStore get _store => ref.read(pendingMarkStoreProvider);

  /// Кладёт отметку в очередь (последняя по позиции побеждает) и сохраняет её
  /// на устройстве.
  Future<void> enqueue(PendingMark mark) async {
    final queue = mergePendingMark(state.valueOrNull ?? const [], mark);
    await _store.write(queue);
    state = AsyncData(queue);
  }

  /// Отправляет очередь по порядку. Обрыв сети останавливает отправку —
  /// остаток ждёт следующей попытки; отказ сервера отбрасывает ровно эту
  /// отметку (повтор её судьбу не изменит), остальные продолжают идти.
  Future<PendingFlushResult> flush() async {
    final queue = state.valueOrNull ?? const <PendingMark>[];
    if (queue.isEmpty) {
      return (sent: 0, rejected: 0, stillOffline: false);
    }

    final done = <PendingMark>[];
    var sent = 0;
    var rejected = 0;
    var stillOffline = false;

    for (final mark in queue) {
      try {
        await _repository.markItem(
          taskId: mark.taskId,
          itemId: mark.itemId,
          status: mark.status,
          pickedQuantity: mark.pickedQuantity,
        );
        done.add(mark);
        sent++;
      } catch (error) {
        if (isOfflineError(error)) {
          stillOffline = true;
          break;
        }
        done.add(mark);
        rejected++;
      }
    }

    final rest = removePendingMarks(queue, done);
    await _store.write(rest);
    state = AsyncData(rest);
    return (sent: sent, rejected: rejected, stillOffline: stillOffline);
  }
}

/// Провайдер очереди неотправленных отметок.
final pendingMarksControllerProvider =
    AsyncNotifierProvider<PendingMarksController, List<PendingMark>>(
      PendingMarksController.new,
    );
