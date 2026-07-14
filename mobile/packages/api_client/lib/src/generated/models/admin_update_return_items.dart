// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_return_items.g.dart';

/// The details to update in the item.
@JsonSerializable()
class AdminUpdateReturnItems {
  const AdminUpdateReturnItems({
    this.quantity,
    this.internalNote,
    this.reasonId,
    this.metadata,
  });

  factory AdminUpdateReturnItems.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateReturnItemsFromJson(json);

  /// The item's quantity.
  final num? quantity;

  /// A note viewed only by admin users.
  @JsonKey(name: 'internal_note')
  final String? internalNote;

  /// The ID of the associated return reason.
  @JsonKey(name: 'reason_id')
  final String? reasonId;

  /// The claim's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateReturnItemsToJson(this);
}
