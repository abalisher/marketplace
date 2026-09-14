import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/estimate_params.dart';
import '../domain/estimator_state.dart';
import 'estimator_repository_provider.dart';

/// Контроллер расчёта материалов: по параметрам формы вызывает
/// [EstimatorRepository] и ведёт статус (загрузка/успех/ошибка) с результатом.
/// Логику держим здесь, не в виджете.
class EstimatorController extends Notifier<EstimatorState> {
  @override
  EstimatorState build() => const EstimatorState();

  /// Запускает расчёт. При ошибке переводит статус в [EstimatorStatus.error]
  /// (сохраняя предыдущий результат) — экран показывает повтор.
  Future<void> calculate(EstimateParams params) async {
    state = state.copyWith(status: EstimatorStatus.loading);
    try {
      final result = await ref
          .read(estimatorRepositoryProvider)
          .calculate(params);
      state = EstimatorState(status: EstimatorStatus.success, result: result);
    } catch (_) {
      state = state.copyWith(status: EstimatorStatus.error);
    }
  }
}

/// Провайдер контроллера расчёта материалов.
final estimatorControllerProvider =
    NotifierProvider<EstimatorController, EstimatorState>(
      EstimatorController.new,
    );
