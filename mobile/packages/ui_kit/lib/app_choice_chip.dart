import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Выбираемый чип дизайн-системы (например, вариант товара). В выбранном
/// состоянии заливается брендовым цветом, иначе — поверхность с границей.
/// Логика выбора живёт снаружи; чип только отображает [selected] и зовёт [onTap].
class AppChoiceChip extends StatelessWidget {
  const AppChoiceChip({
    required this.label,
    required this.selected,
    this.onTap,
    this.minTapHeight,
    super.key,
  });

  /// Подпись чипа (уже локализованная/готовая к показу).
  final String label;

  /// Выбран ли чип сейчас.
  final bool selected;

  /// Обработчик нажатия; если null — чип не интерактивен.
  final VoidCallback? onTap;

  /// Минимальная высота чипа целиком — цель нажатия. По умолчанию чип
  /// обжимается по тексту (~38dp), этого хватает витрине и чату; экранам, по
  /// которым работают одной рукой и в перчатках (склад), нужно 48dp. Вид чипа
  /// при этом не меняется — растёт только область нажатия.
  final double? minTapHeight;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final borderRadius = BorderRadius.circular(AppRadius.pill);
    final background = selected ? colors.accent : colors.surface;
    final foreground = selected ? colors.onAccent : colors.ink;
    final borderColor = selected ? colors.accent : colors.border;
    return Material(
      color: background,
      borderRadius: borderRadius,
      child: InkWell(
        onTap: onTap,
        borderRadius: borderRadius,
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: borderRadius,
            border: Border.all(color: borderColor),
          ),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.sm,
          ),
          child: ConstrainedBox(
            // Ограничение считается ВНУТРИ вертикальных отступов чипа.
            constraints: BoxConstraints(
              minHeight: minTapHeight == null
                  ? 0
                  : (minTapHeight! - AppSpacing.sm * 2).clamp(0, minTapHeight!),
            ),
            child: Center(
              widthFactor: 1,
              child: Text(
                label,
                style: AppTypography.button.copyWith(color: foreground),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
