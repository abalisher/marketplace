import 'package:api_client/api_client.dart'
    show
        MedusaStoreApi,
        PostAuthCustomerAuthProviderResponseSealedAuthResponse,
        StoreCreateCustomer,
        StoreCustomer,
        StoreRequestPhoneOtp,
        StoreVerifyPhoneOtp;
import 'package:dio/dio.dart';

import 'auth_customer.dart';
import 'auth_exception.dart';
import 'auth_repository.dart';
import 'phone_code_request.dart';
import 'session_store.dart';
import 'token_holder.dart';

/// Реализация [AuthRepository] поверх Medusa Store API (провайдер emailpass).
///
/// Токен живёт в двух местах: [AuthTokenHolder] (синхронный доступ для
/// Dio-интерцептора) и [SessionStore] (персистентность между запусками) —
/// репозиторий держит их согласованными.
class MedusaAuthRepository implements AuthRepository {
  MedusaAuthRepository(
    this._api,
    this._publishableKey,
    this._holder,
    this._store,
  );

  final MedusaStoreApi _api;
  final String _publishableKey;
  final AuthTokenHolder _holder;
  final SessionStore _store;

  @override
  Future<AuthCustomer?> restoreSession() async {
    final token = await _store.readToken();
    if (token == null || token.isEmpty) {
      _holder.token = null;
      return null;
    }
    _holder.token = token;
    try {
      return await _fetchCustomer();
    } on DioException {
      // Токен протух/невалиден — тихо чистим сессию и считаем гостем.
      await signOut();
      return null;
    }
  }

  @override
  Future<AuthCustomer> signIn({
    required String email,
    required String password,
  }) async {
    final response = await _guarded(
      () => _api.auth.postActorTypeAuthProvider(
        authProvider: 'emailpass',
        body: {'email': email, 'password': password},
      ),
      onStatus: const {
        401: AuthErrorKind.invalidCredentials,
        400: AuthErrorKind.invalidCredentials,
      },
    );
    final token = switch (response) {
      PostAuthCustomerAuthProviderResponseSealedAuthResponse r => r.token,
      // Для emailpass бэкенд возвращает токен; ветка редиректа сюда не приходит.
      _ => throw const AuthException(AuthErrorKind.unknown),
    };
    await _persist(token);
    return _fetchCustomer();
  }

  @override
  Future<AuthCustomer> register({
    required String email,
    required String password,
    String? firstName,
    String? lastName,
    String? phone,
  }) async {
    final registration = await _guarded(
      () => _api.auth.postActorTypeAuthProviderRegister(
        authProvider: 'emailpass',
        body: {'email': email, 'password': password},
      ),
      onStatus: const {
        401: AuthErrorKind.emailAlreadyExists,
        400: AuthErrorKind.emailAlreadyExists,
        409: AuthErrorKind.emailAlreadyExists,
      },
    );
    // Рег-токен временно кладём в holder — под ним создаётся покупатель.
    _holder.token = registration.token;
    await _guarded(
      () => _api.customers.postCustomers(
        xPublishableApiKey: _publishableKey,
        body: StoreCreateCustomer(
          email: email,
          firstName: firstName,
          lastName: lastName,
          phone: phone,
        ),
      ),
    );
    // Полноценный сессионный токен получаем обычным входом.
    return signIn(email: email, password: password);
  }

  @override
  Future<PhoneCodeRequest> requestPhoneCode(String phone) async {
    try {
      final response = await _api.auth.postAuthPhoneOtp(
        xPublishableApiKey: _publishableKey,
        body: StoreRequestPhoneOtp(phone: phone),
      );
      return PhoneCodeRequest(
        phone: response.phone,
        expiresIn: response.expiresIn,
        resendAfter: response.resendAfter,
        devCode: response.devCode,
      );
    } on DioException catch (error) {
      throw _phoneException(error);
    }
  }

  @override
  Future<AuthCustomer> signInWithPhoneCode({
    required String phone,
    required String code,
  }) async {
    try {
      final response = await _api.auth.postAuthPhoneVerify(
        xPublishableApiKey: _publishableKey,
        body: StoreVerifyPhoneOtp(phone: phone, code: code),
      );
      await _persist(response.token);
      // Профиль берём из /store/customers/me — там он полный и одинаковый для
      // обоих входов (по номеру и по email).
      return _fetchCustomer();
    } on DioException catch (error) {
      throw _phoneException(error);
    }
  }

  /// Переводит ответ роутов входа по номеру в [AuthException]: причина приходит
  /// машинным полем `reason`, по нему экран выбирает текст.
  AuthException _phoneException(DioException error) {
    const networkTypes = {
      DioExceptionType.connectionError,
      DioExceptionType.connectionTimeout,
      DioExceptionType.receiveTimeout,
      DioExceptionType.sendTimeout,
    };
    if (networkTypes.contains(error.type)) {
      return const AuthException(AuthErrorKind.network);
    }

    final data = error.response?.data;
    final body = data is Map ? data : const {};
    final reason = body['reason'];
    final retryAfter = body['retry_after'];
    return switch (reason) {
      'invalid_phone' => const AuthException(AuthErrorKind.invalidPhone),
      'too_many_requests' => AuthException(
        AuthErrorKind.tooManyRequests,
        retryAfter: retryAfter is int ? retryAfter : null,
      ),
      'invalid_code' => const AuthException(AuthErrorKind.invalidCode),
      'code_expired' => const AuthException(AuthErrorKind.codeExpired),
      'too_many_attempts' => const AuthException(AuthErrorKind.tooManyAttempts),
      // Тело без `reason` (например, 400 от валидатора) — не выдумываем причину.
      _ => const AuthException(AuthErrorKind.unknown),
    };
  }

  @override
  Future<void> signOut() async {
    try {
      await _api.auth.deleteSession();
    } on DioException {
      // Выход локальный даже если серверная сессия уже недоступна.
    }
    _holder.token = null;
    await _store.clear();
  }

  Future<void> _persist(String token) async {
    _holder.token = token;
    await _store.writeToken(token);
  }

  Future<AuthCustomer> _fetchCustomer() async {
    final response = await _api.customers.getCustomersMe(
      xPublishableApiKey: _publishableKey,
    );
    return _toAuthCustomer(response.customer);
  }

  AuthCustomer _toAuthCustomer(StoreCustomer customer) {
    String? normalize(String? value) =>
        (value == null || value.isEmpty) ? null : value;
    return AuthCustomer(
      id: customer.id,
      email: customer.email,
      firstName: normalize(customer.firstName),
      lastName: normalize(customer.lastName),
      phone: normalize(customer.phone),
    );
  }

  /// Выполняет вызов, переводя ответы бэкенда/сети в [AuthException]. По
  /// [onStatus] отдельные HTTP-коды маппятся в конкретные типы ошибок.
  Future<T> _guarded<T>(
    Future<T> Function() call, {
    Map<int, AuthErrorKind> onStatus = const {},
  }) async {
    try {
      return await call();
    } on DioException catch (error) {
      final status = error.response?.statusCode;
      final mapped = status == null ? null : onStatus[status];
      if (mapped != null) {
        throw AuthException(mapped);
      }
      const networkTypes = {
        DioExceptionType.connectionError,
        DioExceptionType.connectionTimeout,
        DioExceptionType.receiveTimeout,
        DioExceptionType.sendTimeout,
      };
      throw AuthException(
        networkTypes.contains(error.type)
            ? AuthErrorKind.network
            : AuthErrorKind.unknown,
      );
    }
  }
}
