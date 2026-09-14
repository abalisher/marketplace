// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_category.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductCategory _$AdminProductCategoryFromJson(
  Map<String, dynamic> json,
) => AdminProductCategory(
  categoryChildren: json['category_children'] as List<dynamic>,
  parentCategory: json['parent_category'],
  name: json['name'] as String,
  description: json['description'] as String?,
  id: json['id'] as String,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  handle: json['handle'] as String,
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
  isActive: json['is_active'] as bool,
  isInternal: json['is_internal'] as bool,
  rank: json['rank'] as num,
  parentCategoryId: json['parent_category_id'] as String,
  products: json['products'] as List<dynamic>?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AdminProductCategoryToJson(
  AdminProductCategory instance,
) => <String, dynamic>{
  'category_children': instance.categoryChildren,
  'parent_category': ?instance.parentCategory,
  'products': ?instance.products,
  'name': instance.name,
  'description': ?instance.description,
  'id': instance.id,
  'metadata': ?instance.metadata,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'handle': instance.handle,
  'deleted_at': ?instance.deletedAt?.toIso8601String(),
  'is_active': instance.isActive,
  'is_internal': instance.isInternal,
  'rank': instance.rank,
  'parent_category_id': instance.parentCategoryId,
};
