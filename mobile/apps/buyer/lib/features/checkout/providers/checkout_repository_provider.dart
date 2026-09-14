import 'package:core/config/app_config_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/checkout_repository.dart';
import '../data/medusa_checkout_repository.dart';

/// Провайдер репозитория чекаута. По умолчанию — реализация поверх Medusa;
/// в тестах переопределяется фейком.
final checkoutRepositoryProvider = Provider<CheckoutRepository>((ref) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  return MedusaCheckoutRepository(api, config.publishableKey);
});
