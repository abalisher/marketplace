import 'package:api_client/api_client.dart'
    show
        MedusaStoreApi,
        Params,
        StoreCreateEstimate,
        StoreEstimateSuggestionOption;

import '../domain/estimate_item.dart';
import '../domain/estimate_option.dart';
import '../domain/estimate_params.dart';
import '../domain/estimate_result.dart';
import 'estimator_repository.dart';

/// Реализация [EstimatorRepository] поверх Medusa Store API. Расчёт —
/// `POST /store/estimates` (гость допускается), подборка товаров по сегментам —
/// `GET /store/estimates/{id}/suggestions` (валюта KZT). Отсутствие подборки не
/// ломает показ количеств (как lifecycle у заказов).
///
/// Незаполненные измерители отправляются нулём (контракт: area/volume/count не
/// nullable, `minimum: 0`) — нулевые позиции бэкенд отсеивает сам. Следствие:
/// серверный вывод объёма из площади×высоты не срабатывает, покупатель вводит
/// объём напрямую (мелкий долг).
class MedusaEstimatorRepository implements EstimatorRepository {
  MedusaEstimatorRepository(this._api, this._publishableKey);

  final MedusaStoreApi _api;
  final String _publishableKey;

  @override
  Future<EstimateResult> calculate(EstimateParams params) async {
    final note = params.note?.trim();
    final created = await _api.estimator.postEstimates(
      xPublishableApiKey: _publishableKey,
      body: StoreCreateEstimate(
        params: Params(
          area: params.area ?? 0,
          volume: params.volume ?? 0,
          length: params.length ?? 0,
          height: params.height ?? 0,
          count: params.count ?? 0,
        ),
        note: (note == null || note.isEmpty) ? null : note,
      ),
    );
    final estimateId = created.estimate.id;

    var currencyCode = 'kzt';
    final optionsByLine = <String, List<EstimateOption>>{};
    try {
      final suggestions = await _api.estimator.getEstimatesIdSuggestions(
        id: estimateId,
        xPublishableApiKey: _publishableKey,
      );
      currencyCode = suggestions.currencyCode;
      for (final suggestion in suggestions.suggestions) {
        optionsByLine[suggestion.lineId] = suggestion.options
            .map(_toOption)
            .toList();
      }
    } catch (_) {
      // Подборка недоступна — показываем только рассчитанные количества.
    }

    final items = created.estimate.lines
        .map(
          (line) => EstimateItem(
            materialKind: line.materialKind,
            quantity: line.quantity,
            unit: line.unit,
            options: optionsByLine[line.id] ?? const [],
          ),
        )
        .toList();

    return EstimateResult(
      id: estimateId,
      currencyCode: currencyCode,
      items: items,
    );
  }

  EstimateOption _toOption(StoreEstimateSuggestionOption option) {
    return EstimateOption(
      segment: option.segment.json ?? '',
      productTitle: option.productTitle,
      unitPrice: option.unitPrice,
      total: option.total,
      inStock: option.inStock,
    );
  }
}
