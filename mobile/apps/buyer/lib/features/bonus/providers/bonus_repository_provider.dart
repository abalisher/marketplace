import 'package:core/config/app_config_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/bonus_repository.dart';
import '../data/medusa_bonus_repository.dart';

/// Провайдер репозитория бонусов. По умолчанию — реализация поверх Medusa;
/// в тестах переопределяется фейком.
final bonusRepositoryProvider = Provider<BonusRepository>((ref) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  return MedusaBonusRepository(api, config.publishableKey);
});
