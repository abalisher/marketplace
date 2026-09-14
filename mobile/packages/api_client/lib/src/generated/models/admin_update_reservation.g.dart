// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_reservation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateReservation _$AdminUpdateReservationFromJson(
  Map<String, dynamic> json,
) => AdminUpdateReservation(
  locationId: json['location_id'] as String?,
  quantity: json['quantity'] as num?,
  description: json['description'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminUpdateReservationToJson(
  AdminUpdateReservation instance,
) => <String, dynamic>{
  'location_id': ?instance.locationId,
  'quantity': ?instance.quantity,
  'description': ?instance.description,
  'metadata': ?instance.metadata,
};
