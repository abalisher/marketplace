import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// Чип-подсказка примера на пустом экране чата (спек 1k: высота 48, радиус 12).
/// Поверхность с обводкой, графитовый текст; по тапу отправляет пример как реплику.
class AppSuggestionChip extends StatelessWidget {
  const AppSuggestionChip({
    required this.label,
    required this.onTap,
    super.key,
  });

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Material(
      color: colors.surface,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          constraints: const BoxConstraints(minHeight: 48),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: colors.border),
          ),
          alignment: Alignment.centerLeft,
          child: Text(
            label,
            style: AppTypography.bodyLargeMedium.copyWith(color: colors.ink),
          ),
        ),
      ),
    );
  }
}
