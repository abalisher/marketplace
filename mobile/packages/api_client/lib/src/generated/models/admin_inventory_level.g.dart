// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_inventory_level.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminInventoryLevel _$AdminInventoryLevelFromJson(Map<String, dynamic> json) =>
    AdminInventoryLevel(
      id: json['id'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
      inventoryItemId: json['inventory_item_id'] as String,
      locationId: json['location_id'] as String,
      stockedQuantity: json['stocked_quantity'] as num,
      reservedQuantity: json['reserved_quantity'] as num,
      incomingQuantity: json['incoming_quantity'] as num,
      metadata: json['metadata'],
      availableQuantity: json['available_quantity'] as num,
      inventoryItem: json['inventory_item'],
    );

Map<String, dynamic> _$AdminInventoryLevelToJson(
  AdminInventoryLevel instance,
) => <String, dynamic>{
  'id': instance.id,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'deleted_at': ?instance.deletedAt?.toIso8601String(),
  'inventory_item_id': instance.inventoryItemId,
  'location_id': instance.locationId,
  'stocked_quantity': instance.stockedQuantity,
  'reserved_quantity': instance.reservedQuantity,
  'incoming_quantity': instance.incomingQuantity,
  'metadata': ?instance.metadata,
  'inventory_item': ?instance.inventoryItem,
  'available_quantity': instance.availableQuantity,
};
