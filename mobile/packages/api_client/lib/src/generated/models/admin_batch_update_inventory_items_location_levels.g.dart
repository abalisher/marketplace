// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_update_inventory_items_location_levels.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchUpdateInventoryItemsLocationLevels
_$AdminBatchUpdateInventoryItemsLocationLevelsFromJson(
  Map<String, dynamic> json,
) => AdminBatchUpdateInventoryItemsLocationLevels(
  locationId: json['location_id'] as String,
  inventoryItemId: json['inventory_item_id'] as String,
  stockedQuantity: json['stocked_quantity'] as num?,
  incomingQuantity: json['incoming_quantity'] as num?,
  id: json['id'] as String?,
);

Map<String, dynamic> _$AdminBatchUpdateInventoryItemsLocationLevelsToJson(
  AdminBatchUpdateInventoryItemsLocationLevels instance,
) => <String, dynamic>{
  'location_id': instance.locationId,
  'inventory_item_id': instance.inventoryItemId,
  'stocked_quantity': ?instance.stockedQuantity,
  'incoming_quantity': ?instance.incomingQuantity,
  'id': ?instance.id,
};
