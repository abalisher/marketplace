// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_return_reason.g.dart';

/// The details of the return reason to create.
@JsonSerializable()
class AdminCreateReturnReason {
  const AdminCreateReturnReason({
    required this.value,
    required this.label,
    this.description,
    this.parentReturnReasonId,
    this.metadata,
  });

  factory AdminCreateReturnReason.fromJson(Map<String, Object?> json) =>
      _$AdminCreateReturnReasonFromJson(json);

  /// The return reason's value.
  final String value;

  /// The return reason's label.
  final String label;

  /// The return reason's description.
  final String? description;

  /// The ID of the parent return reason.
  @JsonKey(name: 'parent_return_reason_id')
  final String? parentReturnReasonId;

  /// The return reason's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateReturnReasonToJson(this);
}
