// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product.dart';

part 'store_product_category.g.dart';

/// The category's details.
@JsonSerializable()
class StoreProductCategory {
  const StoreProductCategory({
    required this.id,
    required this.name,
    required this.description,
    required this.handle,
    required this.rank,
    required this.parentCategoryId,
    required this.parentCategory,
    required this.categoryChildren,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    this.metadata,
    this.products,
  });

  factory StoreProductCategory.fromJson(Map<String, Object?> json) =>
      _$StoreProductCategoryFromJson(json);

  /// The category's ID.
  final String id;

  /// The category's name.
  final String name;

  /// The category's description.
  final String description;

  /// The category's handle.
  final String handle;

  /// The category's rank.
  final num rank;

  /// The ID of the category's parent.
  @JsonKey(name: 'parent_category_id')
  final String parentCategoryId;
  @JsonKey(name: 'parent_category')
  final dynamic parentCategory;

  /// The category's children.
  @JsonKey(name: 'category_children')
  final List<dynamic> categoryChildren;

  /// The category's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the category was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the category was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the category was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  /// The category's products.
  final List<StoreProduct>? products;

  Map<String, Object?> toJson() => _$StoreProductCategoryToJson(this);
}
