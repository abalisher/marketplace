import 'package:flutter/material.dart';

import 'app_color_tokens.dart';
import 'app_radius.dart';
import 'app_spacing.dart';

/// Базовая карточка-поверхность дизайн-системы: фон, скругление, граница и
/// внутренний отступ. При заданном [onTap] реагирует на нажатие (ripple).
/// Специфичное содержимое (товар, заказ и т.п.) собирается поверх [AppCard]
/// в конкретных приложениях.
class AppCard extends StatelessWidget {
  const AppCard({required this.child, this.onTap, this.padding, super.key});

  /// Содержимое карточки.
  final Widget child;

  /// Обработчик нажатия; если null — карточка не интерактивна.
  final VoidCallback? onTap;

  /// Внутренний отступ; по умолчанию [AppSpacing.md] со всех сторон.
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    final borderRadius = BorderRadius.circular(AppRadius.md);
    return Material(
      color: colors.surface,
      borderRadius: borderRadius,
      child: InkWell(
        onTap: onTap,
        borderRadius: borderRadius,
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: borderRadius,
            border: Border.all(color: colors.border),
          ),
          padding: padding ?? const EdgeInsets.all(AppSpacing.md),
          child: child,
        ),
      ),
    );
  }
}
