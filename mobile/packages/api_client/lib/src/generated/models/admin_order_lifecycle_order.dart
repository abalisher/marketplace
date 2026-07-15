// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_order_lifecycle_order.g.dart';

@JsonSerializable()
class AdminOrderLifecycleOrder {
  const AdminOrderLifecycleOrder({
    required this.id,
    this.displayId,
    this.email,
    this.createdAt,
  });

  factory AdminOrderLifecycleOrder.fromJson(Map<String, Object?> json) =>
      _$AdminOrderLifecycleOrderFromJson(json);

  final String id;
  @JsonKey(name: 'display_id')
  final int? displayId;
  final String? email;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  Map<String, Object?> toJson() => _$AdminOrderLifecycleOrderToJson(this);
}
