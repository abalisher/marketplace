// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_dispute_category.dart';
import 'store_dispute_status.dart';

part 'store_dispute.g.dart';

@JsonSerializable()
class StoreDispute {
  const StoreDispute({
    required this.id,
    required this.orderId,
    required this.category,
    required this.description,
    required this.status,
    this.resolution,
    this.createdAt,
  });

  factory StoreDispute.fromJson(Map<String, Object?> json) =>
      _$StoreDisputeFromJson(json);

  final String id;
  @JsonKey(name: 'order_id')
  final String orderId;
  final StoreDisputeCategory category;
  final String? description;
  final StoreDisputeStatus status;
  final String? resolution;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  Map<String, Object?> toJson() => _$StoreDisputeToJson(this);
}
