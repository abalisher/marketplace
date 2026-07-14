// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_fulfillment_item.g.dart';

/// An item to fulfill.
@JsonSerializable()
class AdminCreateFulfillmentItem {
  const AdminCreateFulfillmentItem({
    required this.title,
    required this.sku,
    required this.quantity,
    required this.barcode,
    this.lineItemId,
    this.inventoryItemId,
  });

  factory AdminCreateFulfillmentItem.fromJson(Map<String, Object?> json) =>
      _$AdminCreateFulfillmentItemFromJson(json);

  /// The item's title.
  final String title;

  /// The item's SKU.
  final String sku;

  /// The quantity to fulfill of the item.
  final num quantity;

  /// The item's barcode.
  final String barcode;

  /// The ID of the associated line item.
  @JsonKey(name: 'line_item_id')
  final String? lineItemId;

  /// The ID of the inventory item associated with the underlying variant.
  @JsonKey(name: 'inventory_item_id')
  final String? inventoryItemId;

  Map<String, Object?> toJson() => _$AdminCreateFulfillmentItemToJson(this);
}
