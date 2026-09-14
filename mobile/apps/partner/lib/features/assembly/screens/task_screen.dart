import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_status_badge.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/offline_error.dart';
import '../assembly_status_view.dart';
import '../domain/assembly_item_status.dart';
import '../domain/assembly_task.dart';
import '../domain/assembly_task_status.dart';
import '../marks_not_sent_exception.dart';
import '../providers/task_detail_controller.dart';
import '../widgets/partial_quantity_dialog.dart';
import '../widgets/pending_marks_banner.dart';
import '../widgets/task_item_tile.dart';

/// Задание сборки: заказ, позиции с количеством и отметками, одна главная
/// кнопка внизу («Взять в работу» → «Собрано»). Сборщик проходит экран сверху
/// вниз, не переключая вкладок.
class TaskScreen extends ConsumerStatefulWidget {
  const TaskScreen({required this.taskId, super.key});

  final String taskId;

  @override
  ConsumerState<TaskScreen> createState() => _TaskScreenState();
}

class _TaskScreenState extends ConsumerState<TaskScreen> {
  bool _busy = false;

  TaskDetailController get _controller =>
      ref.read(taskDetailControllerProvider(widget.taskId).notifier);

  void _snack(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _run(Messages t, Future<void> Function() action) async {
    setState(() => _busy = true);
    try {
      await action();
    } catch (error) {
      _snack(isOfflineError(error) ? t.errorNetwork : t.actionFailed);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _mark(
    Messages t,
    AssemblyTask task,
    String itemId,
    AssemblyItemStatus status,
  ) async {
    int? quantity;
    if (status == AssemblyItemStatus.partial) {
      final item = task.items.firstWhere((candidate) => candidate.id == itemId);
      quantity = await askPartialQuantity(
        context,
        quantity: item.quantity,
        initial: item.status == AssemblyItemStatus.partial
            ? item.pickedQuantity
            : null,
        t: t,
      );
      // Сборщик закрыл диалог — отметку не ставим.
      if (quantity == null) return;
    }

    await _run(t, () async {
      final queued = await _controller.mark(
        itemId: itemId,
        status: status,
        pickedQuantity: quantity,
      );
      if (queued) _snack(t.markQueuedOffline);
    });
  }

  Future<void> _complete(Messages t) async {
    // Экран после закрытия задания уходит со стека — и мессенджер, и навигатор
    // берём ДО await, иначе сообщать об успехе будет уже некому.
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    setState(() => _busy = true);
    try {
      final summary = await _controller.complete();
      final closed = ref
          .read(taskDetailControllerProvider(widget.taskId))
          .valueOrNull;
      final outcome = closed?.status == AssemblyTaskStatus.shortage
          ? t.taskDoneShortage
          : t.taskDoneAssembled;
      final order = summary.isFinished
          ? t.orderFinished
          : t.orderRemaining(summary.remaining);
      // Закрытое задание в очереди больше не нужно — возвращаем сборщика к
      // списку и одной фразой говорим, что стало с заданием и с заказом.
      navigator.pop();
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text('$outcome. $order')));
    } on MarksNotSentException {
      _snack(t.completeOfflineBlocked);
    } catch (error) {
      _snack(isOfflineError(error) ? t.errorNetwork : t.actionFailed);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = ref.watch(messagesProvider);
    final state = ref.watch(taskDetailControllerProvider(widget.taskId));

    return Scaffold(
      appBar: AppBar(
        title: Text(
          state.valueOrNull == null
              ? t.taskTitle
              : t.orderNumber(state.valueOrNull!.orderDisplayId),
        ),
      ),
      body: state.when(
        loading: () => const AppLoader(),
        error: (error, _) => AppErrorView(
          message: t.taskLoadError,
          retryLabel: t.retry,
          onRetry: () => _controller.reload(),
        ),
        data: (task) => _TaskBody(
          task: task,
          t: t,
          busy: _busy,
          onMark: (itemId, status) => _mark(t, task, itemId, status),
        ),
      ),
      bottomNavigationBar: state.valueOrNull == null
          ? null
          : _BottomAction(
              task: state.value!,
              t: t,
              busy: _busy,
              onStart: () => _run(t, _controller.start),
              onComplete: () => _complete(t),
            ),
    );
  }
}

/// Шапка задания и список позиций.
class _TaskBody extends StatelessWidget {
  const _TaskBody({
    required this.task,
    required this.t,
    required this.busy,
    required this.onMark,
  });

  final AssemblyTask task;
  final Messages t;
  final bool busy;
  final void Function(String itemId, AssemblyItemStatus status) onMark;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return ListView(
      padding: const EdgeInsets.only(bottom: AppSpacing.xl),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.lg,
            AppSpacing.lg,
            0,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      task.categoryName,
                      style: AppTypography.titleMedium,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  AppStatusBadge(
                    label: taskStatusLabel(task.status, t),
                    color: taskStatusColor(task.status, colors),
                  ),
                ],
              ),
              if (task.customerName != null) ...[
                const SizedBox(height: AppSpacing.xs),
                Text(
                  task.customerName!,
                  style: AppTypography.bodyMedium.copyWith(
                    color: colors.inkSecondary,
                  ),
                ),
              ],
              const SizedBox(height: AppSpacing.sm),
              Text(
                t.itemsProgress(task.itemsMarked, task.itemsTotal),
                style: AppTypography.bodyMedium,
              ),
            ],
          ),
        ),
        const PendingMarksBanner(),
        const SizedBox(height: AppSpacing.md),
        for (final item in task.items)
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              0,
              AppSpacing.lg,
              AppSpacing.md,
            ),
            child: TaskItemTile(
              item: item,
              t: t,
              enabled: task.status.acceptsMarks && !busy,
              onMark: (status) => onMark(item.id, status),
            ),
          ),
      ],
    );
  }
}

/// Единственное главное действие экрана — внизу, под большим пальцем.
/// Какое именно, решает статус задания: не взято — «взять», в работе —
/// «собрано» (когда отмечены все позиции), нехватка — «вернуться к сборке».
/// Собранное задание закрыто: кнопки нет вовсе.
class _BottomAction extends StatelessWidget {
  const _BottomAction({
    required this.task,
    required this.t,
    required this.busy,
    required this.onStart,
    required this.onComplete,
  });

  final AssemblyTask task;
  final Messages t;
  final bool busy;
  final VoidCallback onStart;
  final VoidCallback onComplete;

  @override
  Widget build(BuildContext context) {
    if (task.status == AssemblyTaskStatus.assembled) {
      return const SizedBox.shrink();
    }

    final colors = AppColorTokens.of(context);
    final inProgress = task.status == AssemblyTaskStatus.picking;
    final blocked = inProgress && !task.isFullyMarked;

    return SafeArea(
      minimum: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        AppSpacing.lg,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (blocked)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: Text(
                t.completeBlockedHint,
                style: AppTypography.caption.copyWith(
                  color: colors.inkSecondary,
                ),
              ),
            ),
          AppPrimaryButton(
            label: inProgress
                ? t.completeTask
                : (task.status == AssemblyTaskStatus.shortage
                      ? t.resumeTask
                      : t.startTask),
            onPressed: busy || blocked
                ? null
                : (inProgress ? onComplete : onStart),
          ),
        ],
      ),
    );
  }
}
