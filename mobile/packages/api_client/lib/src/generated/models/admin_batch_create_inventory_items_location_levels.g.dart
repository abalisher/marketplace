// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_create_inventory_items_location_levels.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchCreateInventoryItemsLocationLevels
_$AdminBatchCreateInventoryItemsLocationLevelsFromJson(
  Map<String, dynamic> json,
) => AdminBatchCreateInventoryItemsLocationLevels(
  locationId: json['location_id'] as String,
  inventoryItemId: json['inventory_item_id'] as String,
  stockedQuantity: json['stocked_quantity'] as num?,
  incomingQuantity: json['incoming_quantity'] as num?,
);

Map<String, dynamic> _$AdminBatchCreateInventoryItemsLocationLevelsToJson(
  AdminBatchCreateInventoryItemsLocationLevels instance,
) => <String, dynamic>{
  'location_id': instance.locationId,
  'inventory_item_id': instance.inventoryItemId,
  'stocked_quantity': ?instance.stockedQuantity,
  'incoming_quantity': ?instance.incomingQuantity,
};
