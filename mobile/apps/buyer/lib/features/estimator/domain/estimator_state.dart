import 'estimate_result.dart';

/// Статус экрана расчёта: до расчёта / идёт расчёт / готов результат / ошибка.
enum EstimatorStatus { initial, loading, success, error }

/// Состояние расчёта материалов. Форма ввода — эфемерное состояние виджета;
/// здесь — статус запроса и его результат.
class EstimatorState {
  const EstimatorState({this.status = EstimatorStatus.initial, this.result});

  final EstimatorStatus status;
  final EstimateResult? result;

  EstimatorState copyWith({EstimatorStatus? status, EstimateResult? result}) {
    return EstimatorState(
      status: status ?? this.status,
      result: result ?? this.result,
    );
  }
}
