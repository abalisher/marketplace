import 'package:core/auth/auth_exception.dart';

import '../../l10n/messages.dart';

/// Переводит ошибку входа в локализованную фразу. Коды приходят из
/// `AuthException` (репозиторий переводит в них ответы бэкенда), тексты живут
/// в словарях приложения — модель ошибок текстов не хранит.
String staffAuthErrorMessage(Object error, Messages t) {
  if (error is! AuthException) {
    return t.errorUnknown;
  }
  switch (error.kind) {
    case AuthErrorKind.invalidCredentials:
      return t.errorInvalidCredentials;
    case AuthErrorKind.network:
      return t.errorNetwork;
    case AuthErrorKind.emailAlreadyExists:
    case AuthErrorKind.invalidPhone:
    case AuthErrorKind.tooManyRequests:
    case AuthErrorKind.invalidCode:
    case AuthErrorKind.codeExpired:
    case AuthErrorKind.tooManyAttempts:
    case AuthErrorKind.unknown:
      // Остальные коды относятся к покупательским сценариям (регистрация,
      // вход по номеру) — у сотрудника их нет.
      return t.errorUnknown;
  }
}
