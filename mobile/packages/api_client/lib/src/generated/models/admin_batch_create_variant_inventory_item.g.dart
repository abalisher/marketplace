// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_create_variant_inventory_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchCreateVariantInventoryItem
_$AdminBatchCreateVariantInventoryItemFromJson(Map<String, dynamic> json) =>
    AdminBatchCreateVariantInventoryItem(
      requiredQuantity: json['required_quantity'] as num,
      inventoryItemId: json['inventory_item_id'] as String,
      variantId: json['variant_id'] as String,
    );

Map<String, dynamic> _$AdminBatchCreateVariantInventoryItemToJson(
  AdminBatchCreateVariantInventoryItem instance,
) => <String, dynamic>{
  'required_quantity': instance.requiredQuantity,
  'inventory_item_id': instance.inventoryItemId,
  'variant_id': instance.variantId,
};
