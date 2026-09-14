import 'package:api_client/api_client.dart'
    show MedusaStoreApi, PostAuthUserAuthProviderResponseSealedAuthResponse;
import 'package:dio/dio.dart';

import 'auth_exception.dart';
import 'staff_auth_repository.dart';
import 'staff_session_store.dart';
import 'staff_user.dart';
import 'token_holder.dart';

/// Реализация [StaffAuthRepository] поверх `/auth/user/emailpass` (actor
/// `user` — admin-учётка Medusa; у покупателя actor `customer`).
///
/// Токен живёт в двух местах: [AuthTokenHolder] (синхронный доступ для
/// Dio-интерцептора) и [StaffSessionStore] (переживает перезапуск) —
/// репозиторий держит их согласованными. Заголовок `x-publishable-api-key`
/// admin-путям не нужен: он адресует канал продаж витрины, а не панель.
class MedusaStaffAuthRepository implements StaffAuthRepository {
  MedusaStaffAuthRepository(this._api, this._holder, this._store);

  final MedusaStoreApi _api;
  final AuthTokenHolder _holder;
  final StaffSessionStore _store;

  @override
  Future<StaffUser?> restoreSession() async {
    final token = await _store.readToken();
    if (token == null || token.isEmpty) {
      _holder.token = null;
      return null;
    }
    _holder.token = token;
    final email = await _store.readEmail();
    return StaffUser(email: email ?? '');
  }

  @override
  Future<StaffUser> signIn({
    required String email,
    required String password,
  }) async {
    final normalized = email.trim();
    final Object response;
    try {
      response = await _api.adminAuth.adminPostActorTypeAuthProvider(
        authProvider: 'emailpass',
        body: {'email': normalized, 'password': password},
      );
    } on DioException catch (error) {
      throw AuthException(_kindOf(error));
    }

    // emailpass отдаёт токен; ветка редиректа сюда приходит только у
    // сторонних провайдеров (google и т.п.) — их у сотрудников нет.
    final token = switch (response) {
      PostAuthUserAuthProviderResponseSealedAuthResponse r => r.token,
      _ => throw const AuthException(AuthErrorKind.unknown),
    };

    _holder.token = token;
    await _store.writeToken(token);
    await _store.writeEmail(normalized);
    return StaffUser(email: normalized);
  }

  @override
  Future<void> signOut() async {
    _holder.token = null;
    await _store.clear();
  }

  AuthErrorKind _kindOf(DioException error) {
    final status = error.response?.statusCode;
    if (status == 400 || status == 401) {
      return AuthErrorKind.invalidCredentials;
    }
    if (status != null) {
      return AuthErrorKind.unknown;
    }
    // Ответа нет вовсе — склад в подвале без сети: это не «неверный пароль».
    return AuthErrorKind.network;
  }
}
