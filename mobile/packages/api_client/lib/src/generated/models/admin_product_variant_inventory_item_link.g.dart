// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_variant_inventory_item_link.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductVariantInventoryItemLink
_$AdminProductVariantInventoryItemLinkFromJson(Map<String, dynamic> json) =>
    AdminProductVariantInventoryItemLink(
      id: json['id'] as String,
      variantId: json['variant_id'] as String,
      inventoryItemId: json['inventory_item_id'] as String,
      variant: json['variant'],
      inventory: json['inventory'] == null
          ? null
          : AdminInventoryItem.fromJson(
              json['inventory'] as Map<String, dynamic>,
            ),
      requiredQuantity: json['required_quantity'] as num?,
    );

Map<String, dynamic> _$AdminProductVariantInventoryItemLinkToJson(
  AdminProductVariantInventoryItemLink instance,
) => <String, dynamic>{
  'id': instance.id,
  'variant_id': instance.variantId,
  'variant': instance.variant,
  'inventory_item_id': instance.inventoryItemId,
  'inventory': instance.inventory,
  'required_quantity': instance.requiredQuantity,
};
