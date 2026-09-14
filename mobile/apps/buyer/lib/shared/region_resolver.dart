import 'package:api_client/api_client.dart' show MedusaStoreApi;

/// Разрешает id региона KZ (по валюте `kzt`) — Medusa требует регион для расчёта
/// цен и создания корзины. Найденный id кэшируется на время жизни экземпляра,
/// чтобы не запрашивать список регионов повторно. Общий для каталога и корзины.
class RegionResolver {
  RegionResolver(this._api, this._publishableKey);

  final MedusaStoreApi _api;
  final String _publishableKey;

  String? _cached;

  /// Возвращает id региона KZ; при отсутствии совпадения — первый регион; null —
  /// если регионов нет вовсе. Результат кэшируется.
  Future<String?> resolveRegionId() async {
    final cached = _cached;
    if (cached != null) return cached;

    final response = await _api.regions.getRegions(
      xPublishableApiKey: _publishableKey,
      limit: 100,
    );
    if (response.regions.isEmpty) return null;

    final region = response.regions.firstWhere(
      (r) => r.currencyCode.toLowerCase() == 'kzt',
      orElse: () => response.regions.first,
    );
    return _cached = region.id;
  }
}
