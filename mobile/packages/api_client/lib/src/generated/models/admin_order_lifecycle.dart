// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_assignee.dart';
import 'admin_order_lifecycle_delivery_method.dart';
import 'admin_order_lifecycle_delivery_window.dart';
import 'admin_order_lifecycle_order.dart';
import 'admin_order_lifecycle_status.dart';

part 'admin_order_lifecycle.g.dart';

@JsonSerializable()
class AdminOrderLifecycle {
  const AdminOrderLifecycle({
    required this.id,
    required this.status,
    this.previousStatus,
    this.note,
    this.deliveryMethod,
    this.deliveryDate,
    this.deliveryWindow,
    this.createdAt,
    this.updatedAt,
    this.order,
    this.ageHours,
    this.statusHours,
    this.slaHours,
    this.overdue,
    this.assignee,
  });

  factory AdminOrderLifecycle.fromJson(Map<String, Object?> json) =>
      _$AdminOrderLifecycleFromJson(json);

  final String id;
  final AdminOrderLifecycleStatus status;
  @JsonKey(name: 'previous_status')
  final String? previousStatus;
  final String? note;

  /// Способ получения заказа.
  @JsonKey(name: 'delivery_method')
  final AdminOrderLifecycleDeliveryMethod? deliveryMethod;

  /// Дата слота доставки в календарных сутках Астаны (YYYY-MM-DD). null — заказ оформлен до появления слотов.
  @JsonKey(name: 'delivery_date')
  final DateTime? deliveryDate;

  /// Окно приезда машины: morning 09:00–13:00, day 13:00–17:00, evening 17:00–21:00.
  @JsonKey(name: 'delivery_window')
  final AdminOrderLifecycleDeliveryWindow? deliveryWindow;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  final AdminOrderLifecycleOrder? order;

  /// Возраст заказа в часах от оформления.
  @JsonKey(name: 'age_hours')
  final int? ageHours;

  /// Сколько часов заказ стоит в ТЕКУЩЕМ статусе (от последнего перехода).
  @JsonKey(name: 'status_hours')
  final int? statusHours;

  /// Срок стадии в часах (ORDER_SLA_HOURS). null — у статуса срока нет: доставленный, закрытый, отменённый и возвращённый заказ уже никого не ждёт.
  @JsonKey(name: 'sla_hours')
  final int? slaHours;

  /// Заказ стоит в статусе дольше срока стадии.
  final bool? overdue;
  final AdminOrderAssignee? assignee;

  Map<String, Object?> toJson() => _$AdminOrderLifecycleToJson(this);
}
