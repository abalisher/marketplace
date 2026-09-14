import 'package:core/auth/auth_exception.dart';

import '../../l10n/messages.dart';

/// Переводит [AuthErrorKind] в локализованное сообщение для показа на экране.
/// Прочие (нетипизированные) исключения трактуются как [authUnknownError].
String authErrorMessage(Object error, Messages messages) {
  final kind = error is AuthException ? error.kind : AuthErrorKind.unknown;
  return switch (kind) {
    AuthErrorKind.invalidCredentials => messages.authInvalidCredentials,
    AuthErrorKind.emailAlreadyExists => messages.authEmailExists,
    AuthErrorKind.invalidPhone => messages.invalidPhoneNumber,
    AuthErrorKind.tooManyRequests => messages.authTooManyRequests,
    AuthErrorKind.invalidCode => messages.authInvalidCode,
    AuthErrorKind.codeExpired => messages.authCodeExpired,
    AuthErrorKind.tooManyAttempts => messages.authTooManyAttempts,
    AuthErrorKind.network => messages.authNetworkError,
    AuthErrorKind.unknown => messages.authUnknownError,
  };
}
