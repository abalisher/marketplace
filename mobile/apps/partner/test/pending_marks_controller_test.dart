import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:marketplace_partner/features/assembly/domain/assembly_item_status.dart';
import 'package:marketplace_partner/features/assembly/domain/pending_mark.dart';
import 'package:marketplace_partner/features/assembly/providers/assembly_repository_provider.dart';
import 'package:marketplace_partner/features/assembly/providers/pending_mark_store_provider.dart';
import 'package:marketplace_partner/features/assembly/providers/pending_marks_controller.dart';

import 'support/assembly_fakes.dart';

PendingMark mark(String itemId, {String task = 'task_1', int minute = 0}) {
  return PendingMark(
    taskId: task,
    itemId: itemId,
    status: AssemblyItemStatus.picked,
    pickedQuantity: 10,
    createdAt: DateTime(2026, 9, 2, 10, minute),
  );
}

ProviderContainer _container({
  required FakeAssemblyRepository repository,
  required InMemoryPendingMarkStore store,
}) {
  final container = ProviderContainer(
    overrides: [
      assemblyRepositoryProvider.overrideWithValue(repository),
      pendingMarkStoreProvider.overrideWithValue(store),
    ],
  );
  addTearDown(container.dispose);
  return container;
}

void main() {
  test('очередь поднимается с устройства при старте', () async {
    final store = InMemoryPendingMarkStore([mark('i1')]);
    final container = _container(
      repository: FakeAssemblyRepository(),
      store: store,
    );

    final queue = await container.read(pendingMarksControllerProvider.future);
    expect(queue.single.itemId, 'i1');
  });

  test('отметка без сети ложится в очередь и переживает перезапуск', () async {
    final store = InMemoryPendingMarkStore();
    final container = _container(
      repository: FakeAssemblyRepository(),
      store: store,
    );
    await container.read(pendingMarksControllerProvider.future);

    await container
        .read(pendingMarksControllerProvider.notifier)
        .enqueue(mark('i1'));

    expect(
      container.read(pendingMarksControllerProvider).value!.single.itemId,
      'i1',
    );
    // Хранилище — то, что останется после закрытия приложения.
    expect((await store.read()).single.itemId, 'i1');
  });

  test('отправка уводит отметки на сервер в порядке очереди', () async {
    final repository = FakeAssemblyRepository();
    final store = InMemoryPendingMarkStore([mark('i1'), mark('i2', minute: 1)]);
    final container = _container(repository: repository, store: store);
    await container.read(pendingMarksControllerProvider.future);

    final result = await container
        .read(pendingMarksControllerProvider.notifier)
        .flush();

    expect(result.sent, 2);
    expect(result.stillOffline, isFalse);
    expect(repository.marks.map((m) => m.itemId), ['i1', 'i2']);
    expect(container.read(pendingMarksControllerProvider).value, isEmpty);
    expect(await store.read(), isEmpty);
  });

  test(
    'сеть пропала посреди отправки — остаток ждёт следующей попытки',
    () async {
      final repository = FakeAssemblyRepository(markError: offlineError());
      final store = InMemoryPendingMarkStore([
        mark('i1'),
        mark('i2', minute: 1),
      ]);
      final container = _container(repository: repository, store: store);
      await container.read(pendingMarksControllerProvider.future);

      final result = await container
          .read(pendingMarksControllerProvider.notifier)
          .flush();

      expect(result.sent, 0);
      expect(result.stillOffline, isTrue);
      // Ничего не потеряли: обе отметки остались и на экране, и на устройстве.
      expect(container.read(pendingMarksControllerProvider).value!.length, 2);
      expect((await store.read()).length, 2);
    },
  );

  test(
    'отказ сервера отбрасывает ровно эту отметку — очередь не встаёт',
    () async {
      final repository = FakeAssemblyRepository(markError: serverError());
      final store = InMemoryPendingMarkStore([
        mark('i1'),
        mark('i2', minute: 1),
      ]);
      final container = _container(repository: repository, store: store);
      await container.read(pendingMarksControllerProvider.future);

      final result = await container
          .read(pendingMarksControllerProvider.notifier)
          .flush();

      expect(result.rejected, 2);
      expect(result.stillOffline, isFalse);
      expect(container.read(pendingMarksControllerProvider).value, isEmpty);
    },
  );
}
