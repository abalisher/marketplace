// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_geo_zone.dart';
import 'admin_shipping_option.dart';

part 'admin_service_zone.g.dart';

/// The shipping option's service zone.
@JsonSerializable()
class AdminServiceZone {
  const AdminServiceZone({
    required this.id,
    required this.name,
    required this.fulfillmentSetId,
    required this.fulfillmentSet,
    required this.geoZones,
    required this.shippingOptions,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminServiceZone.fromJson(Map<String, Object?> json) =>
      _$AdminServiceZoneFromJson(json);

  /// The service zone's ID.
  final String id;

  /// The service zone's name.
  final String name;

  /// The service zone's fulfillment set id.
  @JsonKey(name: 'fulfillment_set_id')
  final String fulfillmentSetId;
  @JsonKey(name: 'fulfillment_set')
  final dynamic fulfillmentSet;

  /// The service zone's geo zones.
  @JsonKey(name: 'geo_zones')
  final List<AdminGeoZone> geoZones;

  /// The service zone's shipping options.
  @JsonKey(name: 'shipping_options')
  final List<AdminShippingOption> shippingOptions;

  /// The service zone's created at.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The service zone's updated at.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The service zone's deleted at.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminServiceZoneToJson(this);
}
