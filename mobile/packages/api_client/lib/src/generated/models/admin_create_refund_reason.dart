// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_refund_reason.g.dart';

/// The refund reason's details.
@JsonSerializable()
class AdminCreateRefundReason {
  const AdminCreateRefundReason({
    required this.label,
    required this.code,
    this.description,
  });

  factory AdminCreateRefundReason.fromJson(Map<String, Object?> json) =>
      _$AdminCreateRefundReasonFromJson(json);

  /// The refund reason's label.
  final String label;

  /// The refund reason's description.
  final String? description;

  /// The refund reason's code.
  final String code;

  Map<String, Object?> toJson() => _$AdminCreateRefundReasonToJson(this);
}
