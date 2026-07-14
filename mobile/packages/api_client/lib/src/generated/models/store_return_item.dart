// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_return_item.g.dart';

/// The return item's details.
@JsonSerializable()
class StoreReturnItem {
  const StoreReturnItem({
    required this.id,
    required this.quantity,
    required this.receivedQuantity,
    required this.damagedQuantity,
    required this.itemId,
    required this.returnId,
    this.reasonId,
    this.note,
    this.metadata,
  });

  factory StoreReturnItem.fromJson(Map<String, Object?> json) =>
      _$StoreReturnItemFromJson(json);

  /// The item's ID.
  final String id;

  /// The item's quantity.
  final num quantity;

  /// The item's received quantity.
  @JsonKey(name: 'received_quantity')
  final num receivedQuantity;

  /// The item's damaged quantity.
  @JsonKey(name: 'damaged_quantity')
  final num damagedQuantity;

  /// The ID of the item's reason.
  @JsonKey(name: 'reason_id')
  final String? reasonId;

  /// A note with more details on why the item is returned.
  final String? note;

  /// The ID of the item in the order.
  @JsonKey(name: 'item_id')
  final String itemId;

  /// The ID of the return this item belongs to.
  @JsonKey(name: 'return_id')
  final String returnId;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$StoreReturnItemToJson(this);
}
