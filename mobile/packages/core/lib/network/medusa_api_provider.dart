import 'package:api_client/api_client.dart' show MedusaStoreApi;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'dio_provider.dart';

/// Провайдер корневого клиента Medusa Store API. Из него доступны под-клиенты
/// (`.products`, `.carts`, `.customers` и т.д.). baseUrl берётся из настроенного
/// [Dio] (см. [dioProvider]).
final medusaApiProvider = Provider<MedusaStoreApi>((ref) {
  final dio = ref.watch(dioProvider);
  return MedusaStoreApi(dio);
});
