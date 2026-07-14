// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'items4.g.dart';

@JsonSerializable()
class Items4 {
  const Items4({
    required this.id,
    required this.quantity,
    this.description,
    this.internalNote,
    this.reasonId,
    this.metadata,
  });

  factory Items4.fromJson(Map<String, Object?> json) => _$Items4FromJson(json);

  /// The ID of the order's item.
  final String id;

  /// The item's quantity.
  final num quantity;

  /// The item's description.
  final String? description;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The ID of the return reason to associate with the item.
  @JsonKey(name: 'reason_id')
  final String? reasonId;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$Items4ToJson(this);
}
