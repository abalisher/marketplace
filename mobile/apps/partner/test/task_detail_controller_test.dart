import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:marketplace_partner/features/assembly/domain/assembly_item_status.dart';
import 'package:marketplace_partner/features/assembly/domain/assembly_task_status.dart';
import 'package:marketplace_partner/features/assembly/marks_not_sent_exception.dart';
import 'package:marketplace_partner/features/assembly/providers/assembly_repository_provider.dart';
import 'package:marketplace_partner/features/assembly/providers/pending_mark_store_provider.dart';
import 'package:marketplace_partner/features/assembly/providers/pending_marks_controller.dart';
import 'package:marketplace_partner/features/assembly/providers/task_detail_controller.dart';

import 'support/assembly_fakes.dart';

ProviderContainer _container({
  required FakeAssemblyRepository repository,
  InMemoryPendingMarkStore? store,
}) {
  final container = ProviderContainer(
    overrides: [
      assemblyRepositoryProvider.overrideWithValue(repository),
      pendingMarkStoreProvider.overrideWithValue(
        store ?? InMemoryPendingMarkStore(),
      ),
    ],
  );
  addTearDown(container.dispose);
  return container;
}

void main() {
  test('отметка уходит на сервер и обновляет прогресс задания', () async {
    final repository = FakeAssemblyRepository();
    final container = _container(repository: repository);
    final provider = taskDetailControllerProvider('task_1');
    await container.read(provider.future);
    await container.read(pendingMarksControllerProvider.future);

    final queued = await container
        .read(provider.notifier)
        .mark(itemId: 'i1', status: AssemblyItemStatus.picked);

    expect(queued, isFalse);
    expect(repository.marks.single.itemId, 'i1');
    final task = container.read(provider).value!;
    expect(task.items.first.status, AssemblyItemStatus.picked);
    expect(task.itemsMarked, 1);
  });

  test('без сети отметка остаётся у сборщика на экране и в очереди', () async {
    final repository = FakeAssemblyRepository(markError: offlineError());
    final store = InMemoryPendingMarkStore();
    final container = _container(repository: repository, store: store);
    final provider = taskDetailControllerProvider('task_1');
    await container.read(provider.future);
    await container.read(pendingMarksControllerProvider.future);

    final queued = await container
        .read(provider.notifier)
        .mark(itemId: 'i1', status: AssemblyItemStatus.picked);

    expect(queued, isTrue);
    final task = container.read(provider).value!;
    // Экран показывает отметку и верный прогресс, хотя сервер её не видел.
    expect(task.items.first.status, AssemblyItemStatus.picked);
    expect(task.items.first.pickedQuantity, 10);
    expect(task.itemsMarked, 1);
    expect((await store.read()).single.itemId, 'i1');
  });

  test('частичная отметка без сети запоминает набранное количество', () async {
    final repository = FakeAssemblyRepository(markError: offlineError());
    final container = _container(repository: repository);
    final provider = taskDetailControllerProvider('task_1');
    await container.read(provider.future);
    await container.read(pendingMarksControllerProvider.future);

    await container
        .read(provider.notifier)
        .mark(
          itemId: 'i1',
          status: AssemblyItemStatus.partial,
          pickedQuantity: 4,
        );

    final item = container.read(provider).value!.items.first;
    expect(item.status, AssemblyItemStatus.partial);
    expect(item.pickedQuantity, 4);
    expect(container.read(provider).value!.itemsShortage, 1);
  });

  test('отказ сервера показываем сборщику, а не прячем в очередь', () async {
    final repository = FakeAssemblyRepository(markError: serverError());
    final store = InMemoryPendingMarkStore();
    final container = _container(repository: repository, store: store);
    final provider = taskDetailControllerProvider('task_1');
    await container.read(provider.future);
    await container.read(pendingMarksControllerProvider.future);

    await expectLater(
      container
          .read(provider.notifier)
          .mark(itemId: 'i1', status: AssemblyItemStatus.picked),
      throwsA(isA<Object>()),
    );
    expect(await store.read(), isEmpty);
  });

  test('задание не закрыть, пока отметки не уехали', () async {
    final repository = FakeAssemblyRepository(markError: offlineError());
    final container = _container(repository: repository);
    final provider = taskDetailControllerProvider('task_1');
    await container.read(provider.future);
    await container.read(pendingMarksControllerProvider.future);
    await container
        .read(provider.notifier)
        .mark(itemId: 'i1', status: AssemblyItemStatus.picked);

    await expectLater(
      container.read(provider.notifier).complete(),
      throwsA(isA<MarksNotSentException>()),
    );
    expect(repository.completeCalls, 0);
  });

  test('связь вернулась — закрытие сначала досылает отметки', () async {
    final repository = FakeAssemblyRepository(markError: offlineError());
    final container = _container(repository: repository);
    final provider = taskDetailControllerProvider('task_1');
    await container.read(provider.future);
    await container.read(pendingMarksControllerProvider.future);
    await container
        .read(provider.notifier)
        .mark(itemId: 'i1', status: AssemblyItemStatus.picked);
    await container
        .read(provider.notifier)
        .mark(itemId: 'i2', status: AssemblyItemStatus.missing);

    repository.markError = null;
    final summary = await container.read(provider.notifier).complete();

    expect(repository.marks.map((m) => m.itemId), ['i1', 'i2']);
    expect(repository.completeCalls, 1);
    expect(summary.remaining, 1);
    // Нехватка по позиции — задание закрыто как «нехватка».
    expect(container.read(provider).value!.status, AssemblyTaskStatus.shortage);
    expect(container.read(pendingMarksControllerProvider).value, isEmpty);
  });

  test('взятие задания в работу переводит его в «собираю»', () async {
    final repository = FakeAssemblyRepository(
      task: assemblyTask(status: AssemblyTaskStatus.pending),
    );
    final container = _container(repository: repository);
    final provider = taskDetailControllerProvider('task_1');
    await container.read(provider.future);
    await container.read(pendingMarksControllerProvider.future);

    await container.read(provider.notifier).start();

    expect(repository.startCalls, 1);
    expect(container.read(provider).value!.status, AssemblyTaskStatus.picking);
  });
}
