// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_reservation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReservation _$AdminReservationFromJson(Map<String, dynamic> json) =>
    AdminReservation(
      id: json['id'] as String,
      lineItemId: json['line_item_id'] as String,
      locationId: json['location_id'] as String,
      quantity: json['quantity'] as num,
      externalId: json['external_id'] as String?,
      description: json['description'] as String?,
      inventoryItemId: json['inventory_item_id'] as String,
      inventoryItem: json['inventory_item'] == null
          ? null
          : AdminInventoryItem.fromJson(
              json['inventory_item'] as Map<String, dynamic>,
            ),
      metadata: json['metadata'],
      createdBy: json['created_by'] as String?,
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
    );

Map<String, dynamic> _$AdminReservationToJson(AdminReservation instance) =>
    <String, dynamic>{
      'id': instance.id,
      'line_item_id': instance.lineItemId,
      'location_id': instance.locationId,
      'quantity': instance.quantity,
      'external_id': ?instance.externalId,
      'description': ?instance.description,
      'inventory_item_id': instance.inventoryItemId,
      'inventory_item': ?instance.inventoryItem,
      'metadata': ?instance.metadata,
      'created_by': ?instance.createdBy,
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
      'created_at': ?instance.createdAt?.toIso8601String(),
      'updated_at': ?instance.updatedAt?.toIso8601String(),
    };
