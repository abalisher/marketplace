// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_inventory_item.dart';

part 'admin_product_variant_inventory_item_link.g.dart';

/// An association between a product variant and an inventory item.
@JsonSerializable()
class AdminProductVariantInventoryItemLink {
  const AdminProductVariantInventoryItemLink({
    required this.id,
    required this.variantId,
    required this.inventoryItemId,
    this.variant,
    this.inventory,
    this.requiredQuantity,
  });

  factory AdminProductVariantInventoryItemLink.fromJson(
    Map<String, Object?> json,
  ) => _$AdminProductVariantInventoryItemLinkFromJson(json);

  /// The ID of the association.
  final String id;

  /// The associated product variant's ID.
  @JsonKey(name: 'variant_id')
  final String variantId;
  final dynamic variant;

  /// The associated inventory item's ID.
  @JsonKey(name: 'inventory_item_id')
  final String inventoryItemId;
  final AdminInventoryItem? inventory;

  /// The inventory item's required quantity.
  @JsonKey(name: 'required_quantity')
  final num? requiredQuantity;

  Map<String, Object?> toJson() =>
      _$AdminProductVariantInventoryItemLinkToJson(this);
}
