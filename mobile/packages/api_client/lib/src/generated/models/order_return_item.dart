// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'order_return_item.g.dart';

/// The item's items.
@JsonSerializable()
class OrderReturnItem {
  const OrderReturnItem({
    required this.id,
    required this.quantity,
    required this.itemId,
    required this.returnId,
    required this.orderId,
    this.receivedQuantity,
    this.reasonId,
    this.metadata,
    this.createdAt,
    this.updatedAt,
    this.damagedQuantity,
  });

  factory OrderReturnItem.fromJson(Map<String, Object?> json) =>
      _$OrderReturnItemFromJson(json);

  /// The return item's ID.
  final String id;

  /// The return item's quantity.
  final num quantity;

  /// The received quantity of the item. This quantity is added to the stocked inventory quantity of the item.
  @JsonKey(name: 'received_quantity')
  final num? receivedQuantity;

  /// The ID of the return reason associated with the item.
  @JsonKey(name: 'reason_id')
  final String? reasonId;

  /// The ID of the associated order item.
  @JsonKey(name: 'item_id')
  final String itemId;

  /// The ID of the return this return item belongs to.
  @JsonKey(name: 'return_id')
  final String returnId;

  /// The return item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The ID of the order the return belongs to.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The date the item was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the item was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The item's damaged quantity.
  @JsonKey(name: 'damaged_quantity')
  final num? damagedQuantity;

  Map<String, Object?> toJson() => _$OrderReturnItemToJson(this);
}
