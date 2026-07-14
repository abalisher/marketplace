// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_product_category.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateProductCategory _$AdminCreateProductCategoryFromJson(
  Map<String, dynamic> json,
) => AdminCreateProductCategory(
  name: json['name'] as String,
  description: json['description'] as String?,
  handle: json['handle'] as String?,
  isInternal: json['is_internal'] as bool?,
  isActive: json['is_active'] as bool?,
  parentCategoryId: json['parent_category_id'] as String?,
  rank: json['rank'] as num?,
  metadata: json['metadata'],
  externalId: json['external_id'] as String?,
);

Map<String, dynamic> _$AdminCreateProductCategoryToJson(
  AdminCreateProductCategory instance,
) => <String, dynamic>{
  'name': instance.name,
  'description': instance.description,
  'handle': instance.handle,
  'is_internal': instance.isInternal,
  'is_active': instance.isActive,
  'parent_category_id': instance.parentCategoryId,
  'rank': instance.rank,
  'metadata': instance.metadata,
  'external_id': instance.externalId,
};
