import 'package:flutter/material.dart';

/// Второстепенная (текстовая) кнопка дизайн-системы — для ссылок-действий
/// вроде «Нет аккаунта? Зарегистрируйтесь». Стиль берётся из темы
/// (`textButtonTheme`). При null [onPressed] кнопка неактивна.
class AppTextButton extends StatelessWidget {
  const AppTextButton({required this.label, this.onPressed, super.key});

  /// Подпись кнопки (уже локализованная).
  final String label;

  /// Обработчик нажатия; если null — кнопка неактивна.
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton(onPressed: onPressed, child: Text(label));
  }
}
