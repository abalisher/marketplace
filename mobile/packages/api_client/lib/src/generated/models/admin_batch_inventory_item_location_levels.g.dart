// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_inventory_item_location_levels.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchInventoryItemLocationLevels
_$AdminBatchInventoryItemLocationLevelsFromJson(Map<String, dynamic> json) =>
    AdminBatchInventoryItemLocationLevels(
      create: (json['create'] as List<dynamic>?)
          ?.map(
            (e) => AdminBatchCreateInventoryItemLocationLevels.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
      update: (json['update'] as List<dynamic>?)
          ?.map(
            (e) => AdminBatchUpdateInventoryItemLocationLevels.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
      delete: (json['delete'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      force: json['force'] as bool?,
    );

Map<String, dynamic> _$AdminBatchInventoryItemLocationLevelsToJson(
  AdminBatchInventoryItemLocationLevels instance,
) => <String, dynamic>{
  'create': ?instance.create,
  'update': ?instance.update,
  'delete': ?instance.delete,
  'force': ?instance.force,
};
