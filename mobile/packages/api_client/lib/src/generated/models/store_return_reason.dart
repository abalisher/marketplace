// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_return_reason.g.dart';

/// The return reason's details.
@JsonSerializable()
class StoreReturnReason {
  const StoreReturnReason({
    required this.id,
    required this.value,
    required this.label,
    required this.createdAt,
    required this.updatedAt,
    this.description,
    this.metadata,
  });

  factory StoreReturnReason.fromJson(Map<String, Object?> json) =>
      _$StoreReturnReasonFromJson(json);

  /// The return reason's ID.
  final String id;

  /// The return reason's value.
  final String value;

  /// The return reason's label.
  final String label;

  /// The return reason's description.
  final String? description;

  /// The return reason's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the return reason was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the return reason was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() => _$StoreReturnReasonToJson(this);
}
