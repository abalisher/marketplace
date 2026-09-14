// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_my_order_lifecycle_delivery_method.dart';
import 'store_my_order_lifecycle_delivery_window.dart';

part 'store_my_order_lifecycle.g.dart';

@JsonSerializable()
class StoreMyOrderLifecycle {
  const StoreMyOrderLifecycle({
    required this.orderId,
    required this.status,
    required this.deliveryMethod,
    this.previousStatus,
    this.deliveryCode,
    this.deliveryDate,
    this.deliveryWindow,
  });

  factory StoreMyOrderLifecycle.fromJson(Map<String, Object?> json) =>
      _$StoreMyOrderLifecycleFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;

  /// Бизнес-статус заказа (ТЗ): new, paid, assembling, ready, shipping, delivered, closed, cancelled.
  final String status;
  @JsonKey(name: 'previous_status')
  final String? previousStatus;

  /// Способ получения заказа.
  @JsonKey(name: 'delivery_method')
  final StoreMyOrderLifecycleDeliveryMethod deliveryMethod;

  /// Код получения: покупатель называет его при вручении.
  @JsonKey(name: 'delivery_code')
  final String? deliveryCode;

  /// Дата слота доставки в календарных сутках Астаны (YYYY-MM-DD). null — заказ оформлен до появления слотов.
  @JsonKey(name: 'delivery_date')
  final DateTime? deliveryDate;

  /// Окно приезда машины: morning 09:00–13:00, day 13:00–17:00, evening 17:00–21:00.
  @JsonKey(name: 'delivery_window')
  final StoreMyOrderLifecycleDeliveryWindow? deliveryWindow;

  Map<String, Object?> toJson() => _$StoreMyOrderLifecycleToJson(this);
}
