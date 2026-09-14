// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_product_category.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateProductCategory _$AdminUpdateProductCategoryFromJson(
  Map<String, dynamic> json,
) => AdminUpdateProductCategory(
  name: json['name'] as String?,
  description: json['description'] as String?,
  handle: json['handle'] as String?,
  isInternal: json['is_internal'] as bool?,
  isActive: json['is_active'] as bool?,
  parentCategoryId: json['parent_category_id'] as String?,
  metadata: json['metadata'],
  rank: json['rank'] as num?,
  externalId: json['external_id'] as String?,
);

Map<String, dynamic> _$AdminUpdateProductCategoryToJson(
  AdminUpdateProductCategory instance,
) => <String, dynamic>{
  'name': ?instance.name,
  'description': ?instance.description,
  'handle': ?instance.handle,
  'is_internal': ?instance.isInternal,
  'is_active': ?instance.isActive,
  'parent_category_id': ?instance.parentCategoryId,
  'metadata': ?instance.metadata,
  'rank': ?instance.rank,
  'external_id': ?instance.externalId,
};
