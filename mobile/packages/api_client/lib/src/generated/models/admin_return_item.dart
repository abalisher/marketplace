// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_return_item.g.dart';

/// The return item's details.
@JsonSerializable()
class AdminReturnItem {
  const AdminReturnItem({
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

  factory AdminReturnItem.fromJson(Map<String, Object?> json) =>
      _$AdminReturnItemFromJson(json);

  /// The return item's ID.
  final String id;

  /// The return item's quantity.
  final num quantity;

  /// The received quantity of the item. This quantity is added to the stocked inventory quantity of the item.
  @JsonKey(name: 'received_quantity')
  final num receivedQuantity;

  /// The received damaged quantity of the item, which isn't added to the stocked inventory quantity of the item.
  @JsonKey(name: 'damaged_quantity')
  final num damagedQuantity;

  /// The ID of the return reason associated with the item.
  @JsonKey(name: 'reason_id')
  final String? reasonId;

  /// A note about why the item was returned.
  final String? note;

  /// The ID of the associated order item.
  @JsonKey(name: 'item_id')
  final String itemId;

  /// The ID of the return this return item belongs to.
  @JsonKey(name: 'return_id')
  final String returnId;

  /// The return item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminReturnItemToJson(this);
}
