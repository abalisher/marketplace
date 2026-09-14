// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_trip.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateTrip _$AdminCreateTripFromJson(Map<String, dynamic> json) =>
    AdminCreateTrip(
      driverId: json['driver_id'] as String,
      locationId: json['location_id'] as String,
      note: json['note'] as String?,
    );

Map<String, dynamic> _$AdminCreateTripToJson(AdminCreateTrip instance) =>
    <String, dynamic>{
      'driver_id': instance.driverId,
      'location_id': instance.locationId,
      'note': ?instance.note,
    };
