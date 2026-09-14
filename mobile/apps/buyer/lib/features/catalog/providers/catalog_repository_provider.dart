import 'package:core/config/app_config_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/region_resolver_provider.dart';
import '../data/catalog_repository.dart';
import '../data/medusa_catalog_repository.dart';

/// Провайдер репозитория каталога. По умолчанию — реализация поверх Medusa
/// (клиент из `core`); в тестах переопределяется фейком.
final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  final regionResolver = ref.watch(regionResolverProvider);
  return MedusaCatalogRepository(api, config.publishableKey, regionResolver);
});
