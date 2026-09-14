// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_fulfillment_set_service_zone.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateFulfillmentSetServiceZone
_$AdminUpdateFulfillmentSetServiceZoneFromJson(Map<String, dynamic> json) =>
    AdminUpdateFulfillmentSetServiceZone(
      name: json['name'] as String?,
      geoZones: (json['geo_zones'] as List<dynamic>?)
          ?.map(
            (e) => AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
    );

Map<String, dynamic> _$AdminUpdateFulfillmentSetServiceZoneToJson(
  AdminUpdateFulfillmentSetServiceZone instance,
) => <String, dynamic>{'name': ?instance.name, 'geo_zones': ?instance.geoZones};
