// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'inventory.dart';
import 'product.dart';

part 'admin_product_variant_inventory_link.g.dart';

/// A created association between a product variant and an inventory item.
@JsonSerializable()
class AdminProductVariantInventoryLink {
  const AdminProductVariantInventoryLink({
    required this.product,
    required this.inventory,
  });

  factory AdminProductVariantInventoryLink.fromJson(
    Map<String, Object?> json,
  ) => _$AdminProductVariantInventoryLinkFromJson(json);

  /// The product variant's details.
  @JsonKey(name: 'Product')
  final Product product;

  /// The inventory item's details.
  @JsonKey(name: 'Inventory')
  final Inventory inventory;

  Map<String, Object?> toJson() =>
      _$AdminProductVariantInventoryLinkToJson(this);
}
