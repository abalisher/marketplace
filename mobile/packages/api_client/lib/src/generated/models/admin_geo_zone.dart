// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_geo_zone_type.dart';

part 'admin_geo_zone.g.dart';

/// The geo zone's geo zones.
@JsonSerializable()
class AdminGeoZone {
  const AdminGeoZone({
    required this.id,
    required this.type,
    required this.countryCode,
    required this.provinceCode,
    required this.city,
    required this.postalExpression,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminGeoZone.fromJson(Map<String, Object?> json) =>
      _$AdminGeoZoneFromJson(json);

  /// The geo zone's ID.
  final String id;

  /// The geo zone's type.
  final AdminGeoZoneType type;

  /// The geo zone's country code.
  @JsonKey(name: 'country_code')
  final String countryCode;

  /// The geo zone's lower-case ISO 3166-2 province code.
  @JsonKey(name: 'province_code')
  final String provinceCode;

  /// The geo zone's city.
  final String city;

  /// The geo zone's postal expression.
  @JsonKey(name: 'postal_expression')
  final dynamic postalExpression;

  /// The geo zone's created at.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The geo zone's updated at.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The geo zone's deleted at.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$AdminGeoZoneToJson(this);
}
