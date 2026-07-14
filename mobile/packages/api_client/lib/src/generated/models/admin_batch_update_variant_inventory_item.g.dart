// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_update_variant_inventory_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchUpdateVariantInventoryItem
_$AdminBatchUpdateVariantInventoryItemFromJson(Map<String, dynamic> json) =>
    AdminBatchUpdateVariantInventoryItem(
      requiredQuantity: json['required_quantity'] as num,
      inventoryItemId: json['inventory_item_id'] as String,
      variantId: json['variant_id'] as String,
    );

Map<String, dynamic> _$AdminBatchUpdateVariantInventoryItemToJson(
  AdminBatchUpdateVariantInventoryItem instance,
) => <String, dynamic>{
  'required_quantity': instance.requiredQuantity,
  'inventory_item_id': instance.inventoryItemId,
  'variant_id': instance.variantId,
};
