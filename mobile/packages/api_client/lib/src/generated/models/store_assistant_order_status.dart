// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_order_status_delivery_window.dart';
import 'store_assistant_order_status_type.dart';

part 'store_assistant_order_status.g.dart';

@JsonSerializable()
class StoreAssistantOrderStatus {
  const StoreAssistantOrderStatus({
    required this.type,
    required this.displayId,
    required this.statusText,
    required this.deliveryStage,
    required this.courierNote,
    required this.deliveryCode,
    this.deliveryDate,
    this.deliveryWindow,
  });

  factory StoreAssistantOrderStatus.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantOrderStatusFromJson(json);

  final StoreAssistantOrderStatusType type;
  @JsonKey(name: 'display_id')
  final num? displayId;
  @JsonKey(name: 'status_text')
  final String? statusText;

  /// Стадия заказа КОДОМ жизненного цикла: new, confirmed, assembling, partially_assembled, assembled, in_delivery, delivered, closed, canceled, returned. Клиент рисует по ней прогресс и подписывает стадию на своём языке.
  @JsonKey(name: 'delivery_stage')
  final String? deliveryStage;

  /// Прогресс курьера человеческим текстом, если рейс уже создан. null — курьер ещё не назначен.
  @JsonKey(name: 'courier_note')
  final String? courierNote;
  @JsonKey(name: 'delivery_code')
  final String? deliveryCode;

  /// Дата слота доставки в календарных сутках Астаны (YYYY-MM-DD). Клиент подписывает её на своём языке. null — заказ оформлен до появления слотов.
  @JsonKey(name: 'delivery_date')
  final DateTime? deliveryDate;

  /// Окно приезда машины: morning 09:00–13:00, day 13:00–17:00, evening 17:00–21:00. null — слота у заказа нет.
  @JsonKey(name: 'delivery_window')
  final StoreAssistantOrderStatusDeliveryWindow? deliveryWindow;

  Map<String, Object?> toJson() => _$StoreAssistantOrderStatusToJson(this);
}
