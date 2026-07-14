// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_variant_inventory_link.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductVariantInventoryLink _$AdminProductVariantInventoryLinkFromJson(
  Map<String, dynamic> json,
) => AdminProductVariantInventoryLink(
  product: Product.fromJson(json['Product'] as Map<String, dynamic>),
  inventory: Inventory.fromJson(json['Inventory'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminProductVariantInventoryLinkToJson(
  AdminProductVariantInventoryLink instance,
) => <String, dynamic>{
  'Product': instance.product,
  'Inventory': instance.inventory,
};
