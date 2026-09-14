// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_product_type.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateProductType _$AdminUpdateProductTypeFromJson(
  Map<String, dynamic> json,
) => AdminUpdateProductType(
  value: json['value'] as String?,
  metadata: json['metadata'],
  externalId: json['external_id'] as String?,
);

Map<String, dynamic> _$AdminUpdateProductTypeToJson(
  AdminUpdateProductType instance,
) => <String, dynamic>{
  'value': ?instance.value,
  'metadata': ?instance.metadata,
  'external_id': ?instance.externalId,
};
