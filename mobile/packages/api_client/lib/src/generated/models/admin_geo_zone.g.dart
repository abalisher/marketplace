// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_geo_zone.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminGeoZone _$AdminGeoZoneFromJson(Map<String, dynamic> json) => AdminGeoZone(
  id: json['id'] as String,
  type: AdminGeoZoneType.fromJson(json['type'] as String),
  countryCode: json['country_code'] as String,
  provinceCode: json['province_code'] as String,
  city: json['city'] as String,
  postalExpression: json['postal_expression'],
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
);

Map<String, dynamic> _$AdminGeoZoneToJson(AdminGeoZone instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$AdminGeoZoneTypeEnumMap[instance.type]!,
      'country_code': instance.countryCode,
      'province_code': instance.provinceCode,
      'city': instance.city,
      'postal_expression': ?instance.postalExpression,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
    };

const _$AdminGeoZoneTypeEnumMap = {
  AdminGeoZoneType.country: 'country',
  AdminGeoZoneType.province: 'province',
  AdminGeoZoneType.city: 'city',
  AdminGeoZoneType.zip: 'zip',
  AdminGeoZoneType.$unknown: r'$unknown',
};
