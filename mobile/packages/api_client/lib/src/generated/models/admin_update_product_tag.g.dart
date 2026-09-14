// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_product_tag.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateProductTag _$AdminUpdateProductTagFromJson(
  Map<String, dynamic> json,
) => AdminUpdateProductTag(
  value: json['value'] as String?,
  metadata: json['metadata'],
  externalId: json['external_id'] as String?,
);

Map<String, dynamic> _$AdminUpdateProductTagToJson(
  AdminUpdateProductTag instance,
) => <String, dynamic>{
  'value': ?instance.value,
  'metadata': ?instance.metadata,
  'external_id': ?instance.externalId,
};
