import 'package:core/config/app_config_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/medusa_orders_repository.dart';
import '../data/orders_repository.dart';

/// Провайдер репозитория заказов. По умолчанию — реализация поверх Medusa;
/// в тестах переопределяется фейком.
final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  return MedusaOrdersRepository(api, config.publishableKey);
});
