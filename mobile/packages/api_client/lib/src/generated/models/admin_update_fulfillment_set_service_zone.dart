// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_update_fulfillment_set_service_zone_geo_zones_sealed.dart';

part 'admin_update_fulfillment_set_service_zone.g.dart';

/// The service zone's details.
@JsonSerializable()
class AdminUpdateFulfillmentSetServiceZone {
  const AdminUpdateFulfillmentSetServiceZone({this.name, this.geoZones});

  factory AdminUpdateFulfillmentSetServiceZone.fromJson(
    Map<String, Object?> json,
  ) => _$AdminUpdateFulfillmentSetServiceZoneFromJson(json);

  /// The service zone's name.
  final String? name;

  /// The service zone's associated geo zones.
  @JsonKey(name: 'geo_zones')
  final List<AdminUpdateFulfillmentSetServiceZoneGeoZonesSealed>? geoZones;

  Map<String, Object?> toJson() =>
      _$AdminUpdateFulfillmentSetServiceZoneToJson(this);
}
