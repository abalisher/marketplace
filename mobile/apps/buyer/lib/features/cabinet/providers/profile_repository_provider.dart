import 'package:core/config/app_config_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/medusa_profile_repository.dart';
import '../data/profile_repository.dart';

/// Провайдер репозитория профиля кабинета. По умолчанию — реализация поверх
/// Medusa; в тестах переопределяется фейком.
final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  return MedusaProfileRepository(api, config.publishableKey);
});
