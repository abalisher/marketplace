// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_lifecycle_event.dart';
import 'admin_order_lifecycle_res_delivery_method.dart';
import 'admin_order_lifecycle_res_delivery_window.dart';

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
    this.deliveryDate,
    this.deliveryWindow,
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

  /// Дата слота доставки в календарных сутках Астаны (YYYY-MM-DD). null — заказ оформлен до появления слотов.
  @JsonKey(name: 'delivery_date')
  final DateTime? deliveryDate;

  /// Окно приезда машины: morning 09:00–13:00, day 13:00–17:00, evening 17:00–21:00.
  @JsonKey(name: 'delivery_window')
  final AdminOrderLifecycleResDeliveryWindow? deliveryWindow;
  final List<AdminOrderLifecycleEvent> history;

  Map<String, Object?> toJson() => _$AdminOrderLifecycleResToJson(this);
}
