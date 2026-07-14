// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_reservation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateReservation _$AdminCreateReservationFromJson(
  Map<String, dynamic> json,
) => AdminCreateReservation(
  locationId: json['location_id'] as String,
  inventoryItemId: json['inventory_item_id'] as String,
  quantity: json['quantity'] as num,
  lineItemId: json['line_item_id'] as String?,
  description: json['description'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminCreateReservationToJson(
  AdminCreateReservation instance,
) => <String, dynamic>{
  'line_item_id': instance.lineItemId,
  'location_id': instance.locationId,
  'inventory_item_id': instance.inventoryItemId,
  'quantity': instance.quantity,
  'description': instance.description,
  'metadata': instance.metadata,
};
