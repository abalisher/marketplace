import 'package:core/auth/staff_auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_choice_chip.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../assembly_status_view.dart';
import '../domain/assembly_queue.dart';
import '../domain/queue_filter.dart';
import '../providers/queue_filter_provider.dart';
import '../providers/task_queue_controller.dart';
import '../widgets/pending_marks_banner.dart';
import '../widgets/task_card.dart';

/// Главный экран сборщика — «мои задания»: очередь заданий СВОЕЙ категории
/// (её подставляет сервер из учётки, выбрать чужую нельзя), чипы статусов со
/// счётчиками и полоса неотправленных отметок. Обновление — потянуть вниз.
class TasksScreen extends ConsumerWidget {
  const TasksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final queue = ref.watch(taskQueueControllerProvider);
    final colors = AppColorTokens.of(context);
    final group = queue.valueOrNull?.groupName;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(t.tasksTitle),
            if (group != null)
              Text(
                group,
                style: AppTypography.caption.copyWith(
                  color: colors.inkSecondary,
                ),
              ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: t.signOut,
            icon: const Icon(Icons.logout),
            onPressed: () =>
                ref.read(staffAuthControllerProvider.notifier).signOut(),
          ),
        ],
      ),
      body: Column(
        children: [
          _StatusFilters(counts: queue.valueOrNull),
          const PendingMarksBanner(),
          Expanded(
            child: queue.when(
              loading: () => const AppLoader(),
              error: (error, _) => AppErrorView(
                message: t.tasksLoadError,
                retryLabel: t.retry,
                onRetry: () =>
                    ref.read(taskQueueControllerProvider.notifier).reload(),
              ),
              data: (data) => _TaskList(queue: data, t: t),
            ),
          ),
        ],
      ),
    );
  }
}

/// Чипы статусов со счётчиками. «Все» — сброс фильтра.
class _StatusFilters extends ConsumerWidget {
  const _StatusFilters({required this.counts});

  final AssemblyQueue? counts;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final selected = ref.watch(queueFilterProvider);
    final queue = counts;

    // Счётчик чипа — сумма его статусов: у «в работе» их три.
    String label(QueueFilter filter) {
      final count = filter.statuses.fold<int>(
        0,
        (sum, status) => sum + (queue?.countOf(status) ?? 0),
      );
      final name = filter == QueueFilter.active
          ? t.filterActive
          : taskStatusLabel(filter.statuses.single, t);
      return '$name $count';
    }

    return SizedBox(
      height: 56,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        children: [
          for (final filter in QueueFilter.values)
            Padding(
              padding: const EdgeInsets.only(
                right: AppSpacing.sm,
                top: AppSpacing.sm,
                bottom: AppSpacing.sm,
              ),
              child: AppChoiceChip(
                label: label(filter),
                selected: selected == filter,
                // Склад: цель нажатия 48dp (работают одной рукой, в перчатках).
                minTapHeight: 48,
                onTap: () =>
                    ref.read(queueFilterProvider.notifier).state = filter,
              ),
            ),
        ],
      ),
    );
  }
}

/// Список заданий с «потянуть вниз». Пустая очередь — не ошибка: у сборщика
/// бывает и «всё собрано».
class _TaskList extends ConsumerWidget {
  const _TaskList({required this.queue, required this.t});

  final AssemblyQueue queue;
  final Messages t;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColorTokens.of(context);
    return RefreshIndicator(
      onRefresh: () => ref.read(taskQueueControllerProvider.notifier).reload(),
      child: queue.tasks.isEmpty
          ? ListView(
              padding: const EdgeInsets.all(AppSpacing.xl),
              children: [
                Text(
                  // Учётка без категории заданий не получит никогда — это не
                  // «пока пусто», а незаконченная настройка.
                  queue.group == null ? t.groupMissing : t.tasksEmpty,
                  textAlign: TextAlign.center,
                  style: AppTypography.bodyLarge.copyWith(
                    color: colors.inkSecondary,
                  ),
                ),
              ],
            )
          : ListView.separated(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: queue.tasks.length,
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, index) {
                final task = queue.tasks[index];
                return TaskCard(
                  task: task,
                  t: t,
                  onTap: () => context.push('/tasks/${task.id}'),
                );
              },
            ),
    );
  }
}
