// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_add_return_item.g.dart';

/// An item's details.
@JsonSerializable()
class AdminAddReturnItem {
  const AdminAddReturnItem({
    required this.id,
    required this.quantity,
    this.description,
    this.internalNote,
    this.metadata,
  });

  factory AdminAddReturnItem.fromJson(Map<String, Object?> json) =>
      _$AdminAddReturnItemFromJson(json);

  /// The item's ID.
  final String id;

  /// The item's quantity.
  final num quantity;

  /// The item's description.
  final String? description;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminAddReturnItemToJson(this);
}
