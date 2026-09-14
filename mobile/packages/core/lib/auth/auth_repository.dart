import 'auth_customer.dart';
import 'phone_code_request.dart';

/// Контракт авторизации покупателя. Реализация по умолчанию — поверх Medusa
/// ([MedusaAuthRepository]); в тестах переопределяется фейком. Бизнес-логику
/// (валидность учётных данных, уникальность email) решает бэкенд — репозиторий
/// только зовёт API, хранит токен и переводит ошибки в [AuthException].
abstract interface class AuthRepository {
  /// Восстанавливает сессию из хранилища при старте: при валидном токене
  /// возвращает покупателя, иначе null. Протухший токен очищается.
  Future<AuthCustomer?> restoreSession();

  /// Вход по email/паролю. Ошибка — [AuthException].
  Future<AuthCustomer> signIn({
    required String email,
    required String password,
  });

  /// Регистрация: создаёт учётную запись покупателя и входит под ней.
  Future<AuthCustomer> register({
    required String email,
    required String password,
    String? firstName,
    String? lastName,
    String? phone,
  });

  /// Запрашивает код входа на номер телефона (основной вход покупателя, T10.7).
  /// Номер принимается в любой записи — канон считает бэкенд.
  /// Ошибка — [AuthException] (`invalidPhone`, `tooManyRequests`).
  Future<PhoneCodeRequest> requestPhoneCode(String phone);

  /// Вход по номеру и коду. Учётки не было — бэкенд создаёт её тем же вызовом.
  /// Ошибка — [AuthException] (`invalidCode`, `codeExpired`, `tooManyAttempts`).
  Future<AuthCustomer> signInWithPhoneCode({
    required String phone,
    required String code,
  });

  /// Выход: завершает серверную сессию и стирает локальный токен.
  Future<void> signOut();
}
