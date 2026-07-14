// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_order_credit_line.g.dart';

/// The details of a credit line to add to an order.
@JsonSerializable()
class AdminCreateOrderCreditLine {
  const AdminCreateOrderCreditLine({
    required this.amount,
    required this.reference,
    required this.referenceId,
    this.metadata,
  });

  factory AdminCreateOrderCreditLine.fromJson(Map<String, Object?> json) =>
      _$AdminCreateOrderCreditLineFromJson(json);

  /// The amount of the credit line.
  final num amount;

  /// The name of the table that the credit line is referencing.
  final String reference;

  /// The ID of a record in the table that the credit line is referencing.
  @JsonKey(name: 'reference_id')
  final String referenceId;

  /// The credit line's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateOrderCreditLineToJson(this);
}
