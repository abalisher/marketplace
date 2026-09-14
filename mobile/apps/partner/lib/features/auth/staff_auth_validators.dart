import '../../l10n/messages.dart';

/// Проверки формы входа сотрудника. Чистые функции: экран их только зовёт,
/// тексты берутся из словаря локали.
abstract final class StaffAuthValidators {
  /// Минимальная проверка формата — «есть @ и точка после него». Настоящую
  /// проверку делает сервер: задача поля — поймать опечатку, а не заменить
  /// авторизацию.
  static String? email(String? value, Messages t) {
    final email = value?.trim() ?? '';
    if (email.isEmpty) {
      return t.emailRequired;
    }
    final at = email.indexOf('@');
    final dot = email.lastIndexOf('.');
    if (at <= 0 || dot < at + 2 || dot == email.length - 1) {
      return t.emailInvalid;
    }
    return null;
  }

  static String? password(String? value, Messages t) {
    if (value == null || value.isEmpty) {
      return t.passwordRequired;
    }
    return null;
  }
}
