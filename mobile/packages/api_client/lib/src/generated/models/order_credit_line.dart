// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'order_credit_line.g.dart';

/// The credit line's details.
@JsonSerializable()
class OrderCreditLine {
  const OrderCreditLine({
    required this.id,
    required this.orderId,
    required this.order,
    required this.reference,
    required this.referenceId,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    required this.amount,
  });

  factory OrderCreditLine.fromJson(Map<String, Object?> json) =>
      _$OrderCreditLineFromJson(json);

  /// The credit line's ID.
  final String id;

  /// The ID of the associated order.
  @JsonKey(name: 'order_id')
  final String orderId;
  final dynamic order;

  /// The table that this credit line references. For example, `payment_collection`.
  final String reference;

  /// The ID of the record in the referenced table. For example, `paycol_123`.
  @JsonKey(name: 'reference_id')
  final String referenceId;

  /// The credit line's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the credit line was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the credit line was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The credit line's amount.
  final num amount;

  Map<String, Object?> toJson() => _$OrderCreditLineToJson(this);
}
