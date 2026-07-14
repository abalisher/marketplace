// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'reason.dart';

part 'items.g.dart';

@JsonSerializable()
class Items {
  const Items({
    required this.id,
    required this.quantity,
    this.reason,
    this.description,
    this.internalNote,
    this.metadata,
  });

  factory Items.fromJson(Map<String, Object?> json) => _$ItemsFromJson(json);

  /// The ID of the order's item.
  final String id;

  /// The quantity of the order's item to add to the claim.
  final num quantity;

  /// The reason the item is claimed.
  final Reason? reason;

  /// The item's description.
  final String? description;

  /// A note that's only viewed by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// Key-value pairs of custom data.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$ItemsToJson(this);
}
