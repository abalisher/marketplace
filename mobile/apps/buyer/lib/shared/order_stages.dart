import 'package:ui_kit/app_order_status_block.dart';

import '../l10n/messages.dart';

/// Четыре стадии таймлайна заказа из КОДА жизненного цикла (`new`, `confirmed`,
/// `assembling`, `partially_assembled`, `assembled`, `in_delivery`, `delivered`,
/// `closed`, `canceled`, `returned` — контракт `delivery_stage`). Индекс текущей
/// стадии: принят(0) — new/confirmed; собран(1) — сборка/собран; в доставке(2);
/// доставлен(3) — delivered/closed. Пройденные — done, текущая — active, будущие
/// — pending. У отменённого и возвращённого заказа таймлайна нет (пустой список
/// → блок покажет только номер и бейдж статуса).
///
/// Общий для экрана заказа и вставки «статус заказа» в ленте чата: обе
/// платформы рисуют один и тот же прогресс (паритет с витриной, T2.13).
List<AppOrderStage> orderStages(String? status, Messages t) {
  if (status == 'canceled' || status == 'returned') return const [];
  final labels = [
    t.orderStageAccepted,
    t.orderStageAssembled,
    t.orderStageInDelivery,
    t.orderStageDelivered,
  ];
  final current = switch (status) {
    'assembling' || 'partially_assembled' || 'assembled' => 1,
    'in_delivery' => 2,
    'delivered' || 'closed' => 3,
    _ => 0, // new/confirmed/неизвестный
  };
  final finished = status == 'delivered' || status == 'closed';
  return [
    for (var i = 0; i < labels.length; i++)
      AppOrderStage(
        labels[i],
        i < current || finished
            ? AppOrderStageState.done
            : i == current
            ? AppOrderStageState.active
            : AppOrderStageState.pending,
      ),
  ];
}
