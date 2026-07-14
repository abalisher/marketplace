// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_service_zone_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminServiceZoneResponse _$AdminServiceZoneResponseFromJson(
  Map<String, dynamic> json,
) => AdminServiceZoneResponse(
  serviceZone: AdminServiceZone.fromJson(
    json['service_zone'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminServiceZoneResponseToJson(
  AdminServiceZoneResponse instance,
) => <String, dynamic>{'service_zone': instance.serviceZone};
