import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_theme.dart';

import 'package:marketplace_partner/features/assembly/domain/assembly_item_status.dart';
import 'package:marketplace_partner/features/assembly/domain/assembly_queue.dart';
import 'package:marketplace_partner/features/assembly/domain/assembly_task_status.dart';
import 'package:marketplace_partner/features/assembly/providers/assembly_repository_provider.dart';
import 'package:marketplace_partner/features/assembly/providers/pending_mark_store_provider.dart';
import 'package:marketplace_partner/features/assembly/screens/task_screen.dart';
import 'package:marketplace_partner/features/assembly/screens/tasks_screen.dart';

import 'support/assembly_fakes.dart';

Widget _harness(
  Widget child, {
  required FakeAssemblyRepository repository,
  InMemoryPendingMarkStore? store,
}) {
  return ProviderScope(
    overrides: [
      assemblyRepositoryProvider.overrideWithValue(repository),
      pendingMarkStoreProvider.overrideWithValue(
        store ?? InMemoryPendingMarkStore(),
      ),
    ],
    child: MaterialApp(theme: buildAppTheme(), home: child),
  );
}

void main() {
  group('очередь заданий', () {
    testWidgets('строка задания показывает заказ, покупателя и прогресс', (
      tester,
    ) async {
      final repository = FakeAssemblyRepository(
        queue: AssemblyQueue(
          tasks: [
            assemblyTask(
              items: [
                taskItem('i1', status: AssemblyItemStatus.picked, picked: 10),
                taskItem('i2'),
              ],
            ),
          ],
          total: 1,
          countsByStatus: const {AssemblyTaskStatus.picking: 1},
          group: 'finishing',
        ),
      );

      await tester.pumpWidget(
        _harness(const TasksScreen(), repository: repository),
      );
      await tester.pumpAndSettle();

      expect(find.text('Заказ №43'), findsOneWidget);
      expect(find.text('Мадина Ержанова'), findsOneWidget);
      expect(find.text('Отмечено 1 из 2'), findsOneWidget);
      // Категория сборщика подписана в шапке — чью очередь он открыл.
      expect(find.text('Отделочные материалы'), findsOneWidget);
    });

    testWidgets('по умолчанию очередь показывает только работу, не архив', (
      tester,
    ) async {
      final repository = FakeAssemblyRepository(
        queue: const AssemblyQueue.empty(),
      );

      await tester.pumpWidget(
        _harness(const TasksScreen(), repository: repository),
      );
      await tester.pumpAndSettle();

      // Собранные задания за своим чипом: очередь FIFO, и архив прошлых смен
      // всплывал бы над сегодняшней работой.
      expect(repository.queueStatuses, [
        AssemblyTaskStatus.pending,
        AssemblyTaskStatus.picking,
        AssemblyTaskStatus.shortage,
      ]);
      expect(find.textContaining('В работе'), findsOneWidget);
    });

    testWidgets('учётка без категории объясняет, почему заданий нет', (
      tester,
    ) async {
      final repository = FakeAssemblyRepository(
        queue: const AssemblyQueue.empty(),
      );

      await tester.pumpWidget(
        _harness(const TasksScreen(), repository: repository),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('не назначена категория'), findsOneWidget);
    });

    testWidgets('ошибка загрузки предлагает повтор', (tester) async {
      final repository = FakeAssemblyRepository(queueError: Exception('boom'));

      await tester.pumpWidget(
        _harness(const TasksScreen(), repository: repository),
      );
      await tester.pumpAndSettle();

      expect(find.byType(AppErrorView), findsOneWidget);
      expect(find.text('Повторить'), findsOneWidget);
    });
  });

  group('экран задания', () {
    testWidgets('не взятое задание предлагает одно действие — взять в работу', (
      tester,
    ) async {
      final repository = FakeAssemblyRepository(
        task: assemblyTask(status: AssemblyTaskStatus.pending),
      );

      await tester.pumpWidget(
        _harness(const TaskScreen(taskId: 'task_1'), repository: repository),
      );
      await tester.pumpAndSettle();

      expect(find.text('Взять в работу'), findsOneWidget);
      // Пока задание не взято, кнопок отметки нет — сервер их и не примет.
      expect(find.text('Набрал'), findsNothing);
    });

    testWidgets('в работе видны кнопки отметки, а закрытие ждёт все позиции', (
      tester,
    ) async {
      final repository = FakeAssemblyRepository(
        task: assemblyTask(
          items: [
            taskItem('i1', status: AssemblyItemStatus.picked, picked: 10),
            taskItem('i2'),
          ],
        ),
      );

      await tester.pumpWidget(
        _harness(const TaskScreen(taskId: 'task_1'), repository: repository),
      );
      await tester.pumpAndSettle();

      expect(find.text('Набрал'), findsNWidgets(2));
      expect(find.text('Отметьте каждую позицию'), findsOneWidget);
      final button = tester.widget<ElevatedButton>(
        find.widgetWithText(ElevatedButton, 'Собрано'),
      );
      expect(button.onPressed, isNull);
    });

    testWidgets('отметка последней позиции разблокирует «Собрано»', (
      tester,
    ) async {
      final repository = FakeAssemblyRepository(
        task: assemblyTask(
          items: [
            taskItem('i1', status: AssemblyItemStatus.picked, picked: 10),
            taskItem('i2'),
          ],
        ),
      );

      await tester.pumpWidget(
        _harness(const TaskScreen(taskId: 'task_1'), repository: repository),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Набрал').last);
      await tester.pumpAndSettle();

      expect(repository.marks.single.itemId, 'i2');
      final button = tester.widget<ElevatedButton>(
        find.widgetWithText(ElevatedButton, 'Собрано'),
      );
      expect(button.onPressed, isNotNull);
    });

    testWidgets('без сети отметка сохраняется и сборщику об этом говорят', (
      tester,
    ) async {
      final repository = FakeAssemblyRepository(
        markError: offlineError(),
        task: assemblyTask(items: [taskItem('i1')]),
      );

      await tester.pumpWidget(
        _harness(const TaskScreen(taskId: 'task_1'), repository: repository),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Набрал'));
      await tester.pumpAndSettle();

      expect(
        find.text('Нет сети — отметка сохранена, уйдёт сама'),
        findsOneWidget,
      );
      expect(find.text('Отметок ждут сети: 1'), findsOneWidget);
      expect(find.text('Набрано полностью'), findsOneWidget);
    });
  });
}
