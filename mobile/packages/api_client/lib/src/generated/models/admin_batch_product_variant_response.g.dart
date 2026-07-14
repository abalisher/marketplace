// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_product_variant_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchProductVariantResponse _$AdminBatchProductVariantResponseFromJson(
  Map<String, dynamic> json,
) => AdminBatchProductVariantResponse(
  created: (json['created'] as List<dynamic>)
      .map((e) => AdminProductVariant.fromJson(e as Map<String, dynamic>))
      .toList(),
  updated: (json['updated'] as List<dynamic>)
      .map((e) => AdminProductVariant.fromJson(e as Map<String, dynamic>))
      .toList(),
  deleted: Deleted2.fromJson(json['deleted'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminBatchProductVariantResponseToJson(
  AdminBatchProductVariantResponse instance,
) => <String, dynamic>{
  'created': instance.created,
  'updated': instance.updated,
  'deleted': instance.deleted,
};
