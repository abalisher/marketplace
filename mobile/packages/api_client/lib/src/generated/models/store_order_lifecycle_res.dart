// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_order_lifecycle_event.dart';
import 'store_order_lifecycle_res_delivery_method.dart';

part 'store_order_lifecycle_res.g.dart';

@JsonSerializable()
class StoreOrderLifecycleRes {
  const StoreOrderLifecycleRes({
    required this.orderId,
    required this.history,
    this.status,
    this.previousStatus,
    this.note,
    this.deliveryMethod,
    this.deliveryCode,
  });

  factory StoreOrderLifecycleRes.fromJson(Map<String, Object?> json) =>
      _$StoreOrderLifecycleResFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;
  final String? status;
  @JsonKey(name: 'previous_status')
  final String? previousStatus;
  final String? note;

  /// Способ получения заказа.
  @JsonKey(name: 'delivery_method')
  final StoreOrderLifecycleResDeliveryMethod? deliveryMethod;

  /// Код получения (только delivery, после отгрузки): покупатель называет его водителю при вручении. Виден только владельцу заказа.
  @JsonKey(name: 'delivery_code')
  final String? deliveryCode;
  final List<StoreOrderLifecycleEvent> history;

  Map<String, Object?> toJson() => _$StoreOrderLifecycleResToJson(this);
}
