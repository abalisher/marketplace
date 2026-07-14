// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'items6.g.dart';

@JsonSerializable()
class Items6 {
  const Items6({required this.id, required this.quantity, this.internalNote});

  factory Items6.fromJson(Map<String, Object?> json) => _$Items6FromJson(json);

  /// The ID of the item in the order.
  final String id;

  /// The item's quantity.
  final num quantity;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  Map<String, Object?> toJson() => _$Items6ToJson(this);
}
