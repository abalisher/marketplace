// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_dispute_category.dart';
import 'admin_dispute_status.dart';

part 'admin_dispute.g.dart';

@JsonSerializable()
class AdminDispute {
  const AdminDispute({
    required this.id,
    required this.orderId,
    required this.category,
    required this.description,
    required this.status,
    this.customerId,
    this.resolution,
    this.createdAt,
  });

  factory AdminDispute.fromJson(Map<String, Object?> json) =>
      _$AdminDisputeFromJson(json);

  final String id;
  @JsonKey(name: 'order_id')
  final String orderId;
  @JsonKey(name: 'customer_id')
  final String? customerId;
  final AdminDisputeCategory category;
  final String description;
  final AdminDisputeStatus status;
  final String? resolution;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  Map<String, Object?> toJson() => _$AdminDisputeToJson(this);
}
