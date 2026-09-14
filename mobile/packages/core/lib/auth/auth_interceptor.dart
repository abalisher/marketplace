import 'package:dio/dio.dart';

import 'token_holder.dart';

/// Dio-интерцептор: добавляет заголовок `Authorization: Bearer <token>` к
/// каждому запросу, если в [AuthTokenHolder] есть токен сессии. Без токена
/// заголовок не добавляется — публичные запросы (каталог, регион) работают
/// как прежде.
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._holder);

  final AuthTokenHolder _holder;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = _holder.token;
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}
