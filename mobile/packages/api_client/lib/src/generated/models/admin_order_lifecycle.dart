// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_lifecycle_delivery_method.dart';
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
    this.createdAt,
    this.updatedAt,
    this.order,
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
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  final AdminOrderLifecycleOrder? order;

  Map<String, Object?> toJson() => _$AdminOrderLifecycleToJson(this);
}
