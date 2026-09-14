import 'package:core/config/app_config_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/estimator_repository.dart';
import '../data/medusa_estimator_repository.dart';

/// Провайдер репозитория расчёта. По умолчанию — реализация поверх Medusa;
/// в тестах переопределяется фейком.
final estimatorRepositoryProvider = Provider<EstimatorRepository>((ref) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  return MedusaEstimatorRepository(api, config.publishableKey);
});
