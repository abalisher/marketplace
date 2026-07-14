// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_fulfillment_set_service_zone_geo_zones_sealed.dart';

part 'admin_create_fulfillment_set_service_zone.g.dart';

/// Details of the service zone to create for the fulfillment set.
@JsonSerializable()
class AdminCreateFulfillmentSetServiceZone {
  const AdminCreateFulfillmentSetServiceZone({
    required this.name,
    required this.geoZones,
  });

  factory AdminCreateFulfillmentSetServiceZone.fromJson(
    Map<String, Object?> json,
  ) => _$AdminCreateFulfillmentSetServiceZoneFromJson(json);

  /// The service zone's name.
  final String name;

  /// The service zone's geo zones.
  @JsonKey(name: 'geo_zones')
  final List<AdminCreateFulfillmentSetServiceZoneGeoZonesSealed> geoZones;

  Map<String, Object?> toJson() =>
      _$AdminCreateFulfillmentSetServiceZoneToJson(this);
}
