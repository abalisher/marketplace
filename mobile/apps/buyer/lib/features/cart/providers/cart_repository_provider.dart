import 'package:core/config/app_config_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/region_resolver_provider.dart';
import '../data/cart_repository.dart';
import '../data/medusa_cart_repository.dart';

/// Провайдер репозитория корзины. По умолчанию — реализация поверх Medusa
/// (клиент из `core`); в тестах переопределяется фейком.
final cartRepositoryProvider = Provider<CartRepository>((ref) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  final regionResolver = ref.watch(regionResolverProvider);
  return MedusaCartRepository(api, config.publishableKey, regionResolver);
});
