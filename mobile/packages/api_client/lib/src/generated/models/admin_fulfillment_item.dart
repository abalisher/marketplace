// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_fulfillment_item.g.dart';

/// The details of a fulfillment's item.
@JsonSerializable()
class AdminFulfillmentItem {
  const AdminFulfillmentItem({
    required this.id,
    required this.title,
    required this.quantity,
    required this.sku,
    required this.barcode,
    required this.lineItemId,
    required this.inventoryItemId,
    required this.fulfillmentId,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminFulfillmentItem.fromJson(Map<String, Object?> json) =>
      _$AdminFulfillmentItemFromJson(json);

  /// The item's ID.
  final String id;

  /// The item's title.
  final String title;

  /// The item's quantity to be fulfilled.
  final num quantity;

  /// The item's SKU.
  final String sku;

  /// The item's barcode.
  final String barcode;

  /// The ID of the order's line item to be fulfilled.
  @JsonKey(name: 'line_item_id')
  final String lineItemId;

  /// The ID of the inventory item of the underlying product variant.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;

  /// The ID of the fulfillment the item belongs to.
  @JsonKey(name: 'fulfillment_id')
  final String fulfillmentId;

  /// The date the item was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the item was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the item was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$AdminFulfillmentItemToJson(this);
}
