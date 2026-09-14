// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_dispute.dart';
import 'admin_dispute_category.dart';
import 'admin_dispute_outcome.dart';
import 'admin_dispute_source.dart';
import 'admin_dispute_status.dart';
import 'admin_order_lifecycle_order.dart';

part 'admin_dispute_row.g.dart';

/// Строка очереди претензий: претензия + заказ, возраст обращения и просрочка.
@JsonSerializable()
class AdminDisputeRow {
  const AdminDisputeRow({
    required this.id,
    required this.orderId,
    required this.category,
    required this.description,
    required this.status,
    required this.ageHours,
    required this.overdue,
    this.customerId,
    this.resolution,
    this.createdAt,
    this.outcome,
    this.source,
    this.order,
  });

  factory AdminDisputeRow.fromJson(Map<String, Object?> json) =>
      _$AdminDisputeRowFromJson(json);

  final String id;
  @JsonKey(name: 'order_id')
  final String orderId;
  @JsonKey(name: 'customer_id')
  final String? customerId;
  final AdminDisputeCategory category;
  final String? description;
  final AdminDisputeStatus status;
  final String? resolution;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// Последствие решения: что получает покупатель. До закрытия — null.
  final AdminDisputeOutcome? outcome;

  /// Кто завёл претензию: покупатель через чат или оператор с его слов.
  final AdminDisputeSource? source;
  final AdminOrderLifecycleOrder? order;

  /// Сколько часов прошло с момента обращения.
  @JsonKey(name: 'age_hours')
  final int ageHours;

  /// Незакрытая претензия старше срока ответа.
  final bool overdue;

  Map<String, Object?> toJson() => _$AdminDisputeRowToJson(this);
}
