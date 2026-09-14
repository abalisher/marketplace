// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_record_gps_ping.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminRecordGpsPing _$AdminRecordGpsPingFromJson(Map<String, dynamic> json) =>
    AdminRecordGpsPing(
      driverId: json['driver_id'] as String,
      lat: json['lat'] as num,
      lng: json['lng'] as num,
    );

Map<String, dynamic> _$AdminRecordGpsPingToJson(AdminRecordGpsPing instance) =>
    <String, dynamic>{
      'driver_id': instance.driverId,
      'lat': instance.lat,
      'lng': instance.lng,
    };
