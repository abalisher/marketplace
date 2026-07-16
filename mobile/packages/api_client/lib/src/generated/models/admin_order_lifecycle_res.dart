// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_lifecycle_event.dart';
import 'admin_order_lifecycle_res_delivery_method.dart';

part 'admin_order_lifecycle_res.g.dart';

@JsonSerializable()
class AdminOrderLifecycleRes {
  const AdminOrderLifecycleRes({
    required this.orderId,
    required this.history,
    this.status,
    this.previousStatus,
    this.note,
    this.deliveryMethod,
  });

  factory AdminOrderLifecycleRes.fromJson(Map<String, Object?> json) =>
      _$AdminOrderLifecycleResFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;
  final String? status;
  @JsonKey(name: 'previous_status')
  final String? previousStatus;
  final String? note;

  /// Способ получения заказа. Кода получения в admin-ответах нет — он секрет покупателя.
  @JsonKey(name: 'delivery_method')
  final AdminOrderLifecycleResDeliveryMethod? deliveryMethod;
  final List<AdminOrderLifecycleEvent> history;

  Map<String, Object?> toJson() => _$AdminOrderLifecycleResToJson(this);
}
