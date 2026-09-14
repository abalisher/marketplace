import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_customer.dart';
import 'auth_repository.dart';
import 'auth_repository_provider.dart';
import 'phone_code_request.dart';

/// Контроллер авторизации: держит текущего покупателя (`null` — гость) и
/// выполняет вход/регистрацию/выход через [AuthRepository]. Идиома совпадает с
/// `CartController` (AsyncNotifier). При старте состояние восстанавливается из
/// хранилища сессии.
///
/// Ошибки входа/регистрации пробрасываются вызывающему экрану (для показа
/// локализованного сообщения); состояние при этом остаётся гостевым.
class AuthController extends AsyncNotifier<AuthCustomer?> {
  @override
  Future<AuthCustomer?> build() =>
      ref.read(authRepositoryProvider).restoreSession();

  AuthRepository get _repository => ref.read(authRepositoryProvider);

  /// Признак авторизованного покупателя (для гардов роутинга).
  bool get isAuthenticated => state.valueOrNull != null;

  Future<void> signIn({required String email, required String password}) async {
    final customer = await _repository.signIn(email: email, password: password);
    state = AsyncData(customer);
  }

  Future<void> register({
    required String email,
    required String password,
    String? firstName,
    String? lastName,
    String? phone,
  }) async {
    final customer = await _repository.register(
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
    );
    state = AsyncData(customer);
  }

  /// Запрашивает код входа на номер (основной вход, T10.7). Состояние
  /// покупателя не меняется — пока это только отправка кода.
  Future<PhoneCodeRequest> requestPhoneCode(String phone) =>
      _repository.requestPhoneCode(phone);

  /// Вход по номеру и коду: учётки не было — бэкенд создаёт её тем же вызовом.
  Future<void> signInWithPhoneCode({
    required String phone,
    required String code,
  }) async {
    final customer = await _repository.signInWithPhoneCode(
      phone: phone,
      code: code,
    );
    state = AsyncData(customer);
  }

  Future<void> signOut() async {
    await _repository.signOut();
    state = const AsyncData(null);
  }
}

/// Провайдер контроллера авторизации.
final authControllerProvider =
    AsyncNotifierProvider<AuthController, AuthCustomer?>(AuthController.new);
