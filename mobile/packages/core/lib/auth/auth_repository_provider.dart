import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config_provider.dart';
import '../network/medusa_api_provider.dart';
import 'auth_repository.dart';
import 'medusa_auth_repository.dart';
import 'session_store_provider.dart';
import 'token_holder_provider.dart';

/// Провайдер репозитория авторизации. По умолчанию — реализация поверх Medusa;
/// в тестах переопределяется фейком.
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  final holder = ref.watch(authTokenHolderProvider);
  final store = ref.watch(sessionStoreProvider);
  return MedusaAuthRepository(api, config.publishableKey, holder, store);
});
