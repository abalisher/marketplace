// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_refund_reason.g.dart';

/// The properties to update in the refund reason.
@JsonSerializable()
class AdminUpdateRefundReason {
  const AdminUpdateRefundReason({this.label, this.description, this.code});

  factory AdminUpdateRefundReason.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateRefundReasonFromJson(json);

  /// The refund reason's label.
  final String? label;

  /// The refund reason's description.
  final String? description;

  /// The refund reason's code.
  final String? code;

  Map<String, Object?> toJson() => _$AdminUpdateRefundReasonToJson(this);
}
