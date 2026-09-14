import '../domain/estimate_params.dart';
import '../domain/estimate_result.dart';

/// Абстракция расчёта материалов. Экран/контроллер зависят от неё; тесты
/// подставляют фейк, реальная реализация ходит в Medusa Store API.
abstract interface class EstimatorRepository {
  /// Считает материалы по ручным параметрам и подбирает товары по сегментам.
  Future<EstimateResult> calculate(EstimateParams params);
}
