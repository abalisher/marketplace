// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_category.dart';

part 'base_product_category.g.dart';

/// The product category's details.
@JsonSerializable()
class BaseProductCategory {
  const BaseProductCategory({
    required this.categoryChildren,
    required this.parentCategory,
    required this.name,
    required this.description,
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.handle,
    required this.deletedAt,
    required this.isActive,
    required this.isInternal,
    required this.rank,
    required this.parentCategoryId,
    this.products,
    this.metadata,
  });

  factory BaseProductCategory.fromJson(Map<String, Object?> json) =>
      _$BaseProductCategoryFromJson(json);

  /// The category's children.
  @JsonKey(name: 'category_children')
  final List<AdminProductCategory> categoryChildren;
  @JsonKey(name: 'parent_category')
  final AdminProductCategory parentCategory;

  /// The category's products.
  final List<dynamic>? products;

  /// The category's name.
  final String name;

  /// The category's description.
  final String? description;

  /// The category's ID.
  final String id;

  /// The category's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the category was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the category was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The category's unique handle.
  final String handle;

  /// The date the category was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// Whether the category is active. If disabled, the category isn't shown in the storefront.
  @JsonKey(name: 'is_active')
  final bool isActive;

  /// Whether the category is internal. If enabled, the category is only seen by admin users.
  @JsonKey(name: 'is_internal')
  final bool isInternal;

  /// The category's rank among sibling categories.
  final num rank;

  /// The ID of the category's parent.
  @JsonKey(name: 'parent_category_id')
  final String parentCategoryId;

  Map<String, Object?> toJson() => _$BaseProductCategoryToJson(this);
}
