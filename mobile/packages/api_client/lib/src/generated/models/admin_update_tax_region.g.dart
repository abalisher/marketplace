// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_tax_region.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateTaxRegion _$AdminUpdateTaxRegionFromJson(
  Map<String, dynamic> json,
) => AdminUpdateTaxRegion(
  provinceCode: json['province_code'] as String?,
  metadata: json['metadata'],
  providerId: json['provider_id'] as String?,
);

Map<String, dynamic> _$AdminUpdateTaxRegionToJson(
  AdminUpdateTaxRegion instance,
) => <String, dynamic>{
  'province_code': instance.provinceCode,
  'metadata': instance.metadata,
  'provider_id': instance.providerId,
};
