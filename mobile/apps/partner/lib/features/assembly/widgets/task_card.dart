import 'package:flutter/material.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_status_badge.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../assembly_status_view.dart';
import '../domain/assembly_task.dart';

/// Строка очереди сборщика: номер заказа крупно, статус бейджем, прогресс по
/// позициям и отдельная строка нехватки. Карточка целиком — цель нажатия
/// (на складе телефон держат одной рукой, мелкие цели не работают).
class TaskCard extends StatelessWidget {
  const TaskCard({required this.task, required this.t, this.onTap, super.key});

  final AssemblyTask task;
  final Messages t;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return AppCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  t.orderNumber(task.orderDisplayId),
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
          if (task.itemsShortage > 0) ...[
            const SizedBox(height: AppSpacing.xs),
            Text(
              t.shortageCount(task.itemsShortage),
              style: AppTypography.captionSemibold.copyWith(
                color: colors.warning,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
