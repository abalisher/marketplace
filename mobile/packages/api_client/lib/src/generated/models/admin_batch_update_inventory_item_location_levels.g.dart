// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_update_inventory_item_location_levels.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchUpdateInventoryItemLocationLevels
_$AdminBatchUpdateInventoryItemLocationLevelsFromJson(
  Map<String, dynamic> json,
) => AdminBatchUpdateInventoryItemLocationLevels(
  locationId: json['location_id'] as String,
  stockedQuantity: json['stocked_quantity'] as num?,
  incomingQuantity: json['incoming_quantity'] as num?,
  id: json['id'] as String?,
);

Map<String, dynamic> _$AdminBatchUpdateInventoryItemLocationLevelsToJson(
  AdminBatchUpdateInventoryItemLocationLevels instance,
) => <String, dynamic>{
  'stocked_quantity': instance.stockedQuantity,
  'incoming_quantity': instance.incomingQuantity,
  'location_id': instance.locationId,
  'id': instance.id,
};
