import 'package:core/config/app_config_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/medusa_payment_status_repository.dart';
import '../data/payment_status_repository.dart';

/// Провайдер репозитория опроса статуса оплаты Kaspi для экрана 1c. По
/// умолчанию — реализация поверх Medusa; в тестах переопределяется фейком.
final paymentStatusRepositoryProvider = Provider<PaymentStatusRepository>((
  ref,
) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  return MedusaPaymentStatusRepository(api, config.publishableKey);
});
