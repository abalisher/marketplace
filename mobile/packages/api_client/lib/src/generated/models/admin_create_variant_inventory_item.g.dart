// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_variant_inventory_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateVariantInventoryItem _$AdminCreateVariantInventoryItemFromJson(
  Map<String, dynamic> json,
) => AdminCreateVariantInventoryItem(
  requiredQuantity: json['required_quantity'] as num,
  inventoryItemId: json['inventory_item_id'] as String,
);

Map<String, dynamic> _$AdminCreateVariantInventoryItemToJson(
  AdminCreateVariantInventoryItem instance,
) => <String, dynamic>{
  'required_quantity': instance.requiredQuantity,
  'inventory_item_id': instance.inventoryItemId,
};
