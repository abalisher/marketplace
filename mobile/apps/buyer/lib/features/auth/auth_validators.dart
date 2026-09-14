import '../../l10n/messages.dart';

/// Валидаторы форм авторизации. Проверяют только формат ввода на клиенте
/// (обязательность/вид email/длина пароля) — бизнес-правила (существование
/// учётки, занятость email) остаются за бэкендом.
class AuthValidators {
  const AuthValidators._();

  static final RegExp _email = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

  static String? email(String? value, Messages messages) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return messages.fieldRequired;
    if (!_email.hasMatch(text)) return messages.invalidEmail;
    return null;
  }

  /// Номер телефона: на клиенте проверяем только, что это похоже на мобильный
  /// номер Казахстана (10 цифр после кода страны). Канон считает бэкенд.
  static String? phone(String? value, Messages messages) {
    final digits = (value ?? '').replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return messages.fieldRequired;
    final national = switch (digits.length) {
      11 when digits.startsWith('7') || digits.startsWith('8') =>
        digits.substring(1),
      10 => digits,
      _ => null,
    };
    if (national == null || !national.startsWith('7')) {
      return messages.invalidPhoneNumber;
    }
    return null;
  }

  /// Код из SMS: только цифры, 4–8 знаков (длину задаёт бэкенд).
  static String? code(String? value, Messages messages) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return messages.fieldRequired;
    if (!RegExp(r'^\d{4,8}$').hasMatch(text)) return messages.authInvalidCode;
    return null;
  }

  static String? password(String? value, Messages messages) {
    if (value == null || value.isEmpty) return messages.fieldRequired;
    if (value.length < 6) return messages.passwordTooShort;
    return null;
  }
}
