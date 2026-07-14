// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_refund_reason.g.dart';

/// The refund reason's details.
@JsonSerializable()
class AdminRefundReason {
  const AdminRefundReason({
    required this.id,
    required this.label,
    required this.createdAt,
    required this.updatedAt,
    required this.code,
    this.description,
    this.metadata,
  });

  factory AdminRefundReason.fromJson(Map<String, Object?> json) =>
      _$AdminRefundReasonFromJson(json);

  /// The refund reason's ID.
  final String id;

  /// The refund reason's label.
  final String label;

  /// The refund reason's description.
  final String? description;

  /// The refund reason's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the refund reason was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the refund reason was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The refund reason's code.
  final String code;

  Map<String, Object?> toJson() => _$AdminRefundReasonToJson(this);
}
