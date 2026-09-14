// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_product_type.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateProductType _$AdminCreateProductTypeFromJson(
  Map<String, dynamic> json,
) => AdminCreateProductType(
  value: json['value'] as String,
  metadata: json['metadata'],
  externalId: json['external_id'] as String?,
);

Map<String, dynamic> _$AdminCreateProductTypeToJson(
  AdminCreateProductType instance,
) => <String, dynamic>{
  'metadata': ?instance.metadata,
  'value': instance.value,
  'external_id': ?instance.externalId,
};
