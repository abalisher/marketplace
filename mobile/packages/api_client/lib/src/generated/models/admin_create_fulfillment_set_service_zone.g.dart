// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_fulfillment_set_service_zone.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateFulfillmentSetServiceZone
_$AdminCreateFulfillmentSetServiceZoneFromJson(Map<String, dynamic> json) =>
    AdminCreateFulfillmentSetServiceZone(
      name: json['name'] as String,
      geoZones: (json['geo_zones'] as List<dynamic>)
          .map(
            (e) => AdminCreateFulfillmentSetServiceZoneGeoZonesSealed.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
    );

Map<String, dynamic> _$AdminCreateFulfillmentSetServiceZoneToJson(
  AdminCreateFulfillmentSetServiceZone instance,
) => <String, dynamic>{'name': instance.name, 'geo_zones': instance.geoZones};
