// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_gps_ping.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminGpsPing _$AdminGpsPingFromJson(Map<String, dynamic> json) => AdminGpsPing(
  id: json['id'] as String,
  tripId: json['trip_id'] as String,
  driverId: json['driver_id'] as String,
  lat: json['lat'] as num,
  lng: json['lng'] as num,
  recordedAt: DateTime.parse(json['recorded_at'] as String),
);

Map<String, dynamic> _$AdminGpsPingToJson(AdminGpsPing instance) =>
    <String, dynamic>{
      'id': instance.id,
      'trip_id': instance.tripId,
      'driver_id': instance.driverId,
      'lat': instance.lat,
      'lng': instance.lng,
      'recorded_at': instance.recordedAt.toIso8601String(),
    };
