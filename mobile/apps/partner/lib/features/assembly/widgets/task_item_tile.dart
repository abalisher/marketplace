import 'package:flutter/material.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_radius.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../assembly_status_view.dart';
import '../domain/assembly_item_status.dart';
import '../domain/assembly_task_item.dart';

/// Позиция задания: что взять, сколько нужно, текущая отметка и три кнопки
/// решения — «Набрал», «Частично», «Нет». Кнопки крупные и в один ряд: у полки
/// работают одной рукой и не глядя целятся в мелкое.
///
/// Кнопки показываются только когда задание в работе ([enabled]); у взятого не
/// в работу задания отмечать нечего — сервер такую отметку и не примет.
class TaskItemTile extends StatelessWidget {
  const TaskItemTile({
    required this.item,
    required this.t,
    required this.enabled,
    required this.onMark,
    super.key,
  });

  final AssemblyTaskItem item;
  final Messages t;
  final bool enabled;

  /// Отметка выбрана. Для «частично» количество спрашивает вызывающий экран.
  final void Function(AssemblyItemStatus status) onMark;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(item.title, style: AppTypography.bodyLargeMedium),
          if (item.sku != null) ...[
            const SizedBox(height: AppSpacing.xs),
            Text(
              t.sku(item.sku!),
              style: AppTypography.caption.copyWith(color: colors.inkSecondary),
            ),
          ],
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              Text(
                t.requiredQuantity(item.quantity),
                style: AppTypography.bodyLargeSemibold,
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  itemStatusLabel(
                    item.status,
                    t,
                    picked: item.pickedQuantity,
                    quantity: item.quantity,
                  ),
                  style: AppTypography.captionSemibold.copyWith(
                    color: itemStatusColor(item.status, colors),
                  ),
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
          if (enabled) ...[
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: _MarkButton(
                    label: t.markPicked,
                    color: colors.success,
                    selected: item.status == AssemblyItemStatus.picked,
                    onPressed: () => onMark(AssemblyItemStatus.picked),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: _MarkButton(
                    label: t.markPartial,
                    color: colors.warning,
                    selected: item.status == AssemblyItemStatus.partial,
                    onPressed: () => onMark(AssemblyItemStatus.partial),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: _MarkButton(
                    label: t.markMissing,
                    color: colors.error,
                    selected: item.status == AssemblyItemStatus.missing,
                    onPressed: () => onMark(AssemblyItemStatus.missing),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

/// Кнопка отметки: выбранная заливается своим цветом, остальные — контурные.
/// Высота 48 — минимальная цель нажатия для работы в перчатках.
class _MarkButton extends StatelessWidget {
  const _MarkButton({
    required this.label,
    required this.color,
    required this.selected,
    required this.onPressed,
  });

  final String label;
  final Color color;
  final bool selected;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final borderRadius = BorderRadius.circular(AppRadius.md);
    return Material(
      color: selected ? color : colors.surface,
      borderRadius: borderRadius,
      child: InkWell(
        onTap: onPressed,
        borderRadius: borderRadius,
        child: Ink(
          height: 48,
          decoration: BoxDecoration(
            borderRadius: borderRadius,
            border: Border.all(color: selected ? color : colors.border),
          ),
          child: Center(
            child: Text(
              label,
              style: AppTypography.button.copyWith(
                color: selected ? colors.onAccent : colors.ink,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
