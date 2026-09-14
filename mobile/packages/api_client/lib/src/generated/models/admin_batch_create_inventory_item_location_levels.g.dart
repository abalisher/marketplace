// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_create_inventory_item_location_levels.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchCreateInventoryItemLocationLevels
_$AdminBatchCreateInventoryItemLocationLevelsFromJson(
  Map<String, dynamic> json,
) => AdminBatchCreateInventoryItemLocationLevels(
  locationId: json['location_id'] as String,
  stockedQuantity: json['stocked_quantity'] as num?,
  incomingQuantity: json['incoming_quantity'] as num?,
);

Map<String, dynamic> _$AdminBatchCreateInventoryItemLocationLevelsToJson(
  AdminBatchCreateInventoryItemLocationLevels instance,
) => <String, dynamic>{
  'location_id': instance.locationId,
  'stocked_quantity': ?instance.stockedQuantity,
  'incoming_quantity': ?instance.incomingQuantity,
};
