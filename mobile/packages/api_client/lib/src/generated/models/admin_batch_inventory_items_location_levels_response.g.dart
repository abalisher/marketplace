// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_inventory_items_location_levels_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchInventoryItemsLocationLevelsResponse
_$AdminBatchInventoryItemsLocationLevelsResponseFromJson(
  Map<String, dynamic> json,
) => AdminBatchInventoryItemsLocationLevelsResponse(
  created: (json['created'] as List<dynamic>?)
      ?.map((e) => AdminInventoryLevel.fromJson(e as Map<String, dynamic>))
      .toList(),
  updated: (json['updated'] as List<dynamic>?)
      ?.map((e) => AdminInventoryLevel.fromJson(e as Map<String, dynamic>))
      .toList(),
  deleted: (json['deleted'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$AdminBatchInventoryItemsLocationLevelsResponseToJson(
  AdminBatchInventoryItemsLocationLevelsResponse instance,
) => <String, dynamic>{
  'created': instance.created,
  'updated': instance.updated,
  'deleted': instance.deleted,
};
