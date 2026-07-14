// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_return_reason.g.dart';

/// The details to update in a return reason.
@JsonSerializable()
class AdminUpdateReturnReason {
  const AdminUpdateReturnReason({
    required this.label,
    required this.value,
    this.description,
    this.metadata,
  });

  factory AdminUpdateReturnReason.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateReturnReasonFromJson(json);

  /// The return reason's label.
  final String label;

  /// The return reason's value.
  final String value;

  /// The return reason's description.
  final String? description;

  /// The return reason's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateReturnReasonToJson(this);
}
