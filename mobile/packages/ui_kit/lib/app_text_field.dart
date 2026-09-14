import 'package:flutter/material.dart';

/// Текстовое поле дизайн-системы поверх [TextFormField]. Оформление берётся из
/// темы (`inputDecorationTheme`) — локально задаём только семантику поля
/// (метка, тип клавиатуры, скрытие пароля, валидатор). Пригодно для форм
/// (валидация через `Form`).
class AppTextField extends StatelessWidget {
  const AppTextField({
    required this.controller,
    required this.label,
    this.helperText,
    this.obscureText = false,
    this.keyboardType,
    this.textInputAction,
    this.validator,
    this.onFieldSubmitted,
    this.enabled = true,
    super.key,
  });

  final TextEditingController controller;

  /// Метка поля (уже локализованная).
  final String label;

  /// Подсказка под полем — требование к формату («12 цифр»). Показывается,
  /// пока поле без ошибки; уже локализованная.
  final String? helperText;

  /// Скрывать ли ввод (пароль).
  final bool obscureText;

  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;

  /// Валидатор для использования внутри [Form]; возвращает текст ошибки/null.
  final String? Function(String?)? validator;

  final ValueChanged<String>? onFieldSubmitted;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      validator: validator,
      onFieldSubmitted: onFieldSubmitted,
      enabled: enabled,
      decoration: InputDecoration(
        labelText: label,
        helperText: helperText,
        border: const OutlineInputBorder(),
      ),
    );
  }
}
