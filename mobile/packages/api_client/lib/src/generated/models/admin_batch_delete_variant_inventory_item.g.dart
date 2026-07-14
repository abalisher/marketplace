// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_delete_variant_inventory_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchDeleteVariantInventoryItem
_$AdminBatchDeleteVariantInventoryItemFromJson(Map<String, dynamic> json) =>
    AdminBatchDeleteVariantInventoryItem(
      inventoryItemId: json['inventory_item_id'] as String,
      variantId: json['variant_id'] as String,
    );

Map<String, dynamic> _$AdminBatchDeleteVariantInventoryItemToJson(
  AdminBatchDeleteVariantInventoryItem instance,
) => <String, dynamic>{
  'inventory_item_id': instance.inventoryItemId,
  'variant_id': instance.variantId,
};
