// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_product_tag.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateProductTag _$AdminCreateProductTagFromJson(
  Map<String, dynamic> json,
) => AdminCreateProductTag(
  value: json['value'] as String,
  metadata: json['metadata'],
  externalId: json['external_id'] as String?,
);

Map<String, dynamic> _$AdminCreateProductTagToJson(
  AdminCreateProductTag instance,
) => <String, dynamic>{
  'value': instance.value,
  'metadata': ?instance.metadata,
  'external_id': ?instance.externalId,
};
