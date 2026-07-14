// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'items9.g.dart';

@JsonSerializable()
class Items9 {
  const Items9({
    required this.id,
    required this.quantity,
    this.description,
    this.internalNote,
  });

  factory Items9.fromJson(Map<String, Object?> json) => _$Items9FromJson(json);

  /// The ID of the item in the order.
  final String id;

  /// The item's quantity.
  final num quantity;

  /// The item's description.
  final String? description;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  Map<String, Object?> toJson() => _$Items9ToJson(this);
}
