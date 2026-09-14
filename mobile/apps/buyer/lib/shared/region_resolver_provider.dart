import 'package:core/config/app_config_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'region_resolver.dart';

/// Провайдер общего резолвера региона (каталог + корзина). Держится синглтоном,
/// поэтому список регионов запрашивается один раз на всё приложение.
final regionResolverProvider = Provider<RegionResolver>((ref) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  return RegionResolver(api, config.publishableKey);
});
