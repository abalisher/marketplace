import 'package:flutter/material.dart';

import 'app_spacing.dart';

/// Основная (акцентная) кнопка дизайн-системы на всю ширину. Стиль берётся из
/// темы (`elevatedButtonTheme`) — цвета/скругление/высоту не задаём локально.
/// При null [onPressed] кнопка неактивна.
class AppPrimaryButton extends StatelessWidget {
  const AppPrimaryButton({
    required this.label,
    this.onPressed,
    this.icon,
    super.key,
  });

  /// Подпись кнопки (уже локализованная).
  final String label;

  /// Обработчик нажатия; если null — кнопка неактивна.
  final VoidCallback? onPressed;

  /// Опциональная иконка перед подписью.
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final icon = this.icon;
    if (icon == null) {
      return ElevatedButton(onPressed: onPressed, child: Text(label));
    }
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: AppSpacing.lg),
      label: Text(label),
    );
  }
}
