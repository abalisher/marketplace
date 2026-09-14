import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_interceptor.dart';
import '../auth/token_holder_provider.dart';
import '../config/app_config_provider.dart';

/// Провайдер настроенного [Dio]: базовый URL и заголовок публикуемого ключа
/// витрины подставляются из [AppConfig]. Токен сессии покупателя добавляет
/// [AuthInterceptor] из общего [authTokenHolderProvider]. Все сетевые вызовы
/// идут через этот Dio.
final dioProvider = Provider<Dio>((ref) {
  final config = ref.watch(appConfigProvider);
  final tokenHolder = ref.watch(authTokenHolderProvider);

  final dio = Dio(
    BaseOptions(
      baseUrl: config.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        if (config.publishableKey.isNotEmpty)
          'x-publishable-api-key': config.publishableKey,
      },
    ),
  );

  dio.interceptors.add(AuthInterceptor(tokenHolder));

  return dio;
});
