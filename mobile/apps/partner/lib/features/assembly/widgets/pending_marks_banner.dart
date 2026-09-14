import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_radius.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_text_button.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages_provider.dart';
import '../providers/pending_marks_controller.dart';
import '../providers/task_queue_controller.dart';

/// Полоса «отметки ждут сети»: сборщик обязан видеть, что его работа сохранена,
/// но ещё не уехала — иначе он либо переотмечает всё заново, либо считает
/// задание закрытым. Пока очередь пуста, полосы нет вовсе.
class PendingMarksBanner extends ConsumerStatefulWidget {
  const PendingMarksBanner({super.key});

  @override
  ConsumerState<PendingMarksBanner> createState() => _PendingMarksBannerState();
}

class _PendingMarksBannerState extends ConsumerState<PendingMarksBanner> {
  bool _sending = false;

  Future<void> _send() async {
    final t = ref.read(messagesProvider);
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _sending = true);
    try {
      final result = await ref
          .read(pendingMarksControllerProvider.notifier)
          .flush();
      if (result.stillOffline) {
        messenger
          ..hideCurrentSnackBar()
          ..showSnackBar(SnackBar(content: Text(t.errorNetwork)));
      }
      if (result.sent > 0) {
        // Отправленные отметки меняют прогресс заданий в очереди.
        ref.invalidate(taskQueueControllerProvider);
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pending = ref.watch(pendingMarksControllerProvider).valueOrNull ?? [];
    if (pending.isEmpty) {
      return const SizedBox.shrink();
    }

    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    return Container(
      margin: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        0,
      ),
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.sm,
        AppSpacing.sm,
        AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: colors.warning),
      ),
      child: Row(
        children: [
          Icon(Icons.cloud_off, color: colors.warning, size: AppSpacing.xl),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              t.pendingMarks(pending.length),
              style: AppTypography.bodyMedium,
            ),
          ),
          AppTextButton(
            label: t.sendPending,
            onPressed: _sending ? null : _send,
          ),
        ],
      ),
    );
  }
}
