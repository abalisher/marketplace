// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_product_category.g.dart';

/// The product category's details.
@JsonSerializable()
class AdminCreateProductCategory {
  const AdminCreateProductCategory({
    required this.name,
    this.description,
    this.handle,
    this.isInternal,
    this.isActive,
    this.parentCategoryId,
    this.rank,
    this.metadata,
    this.externalId,
  });

  factory AdminCreateProductCategory.fromJson(Map<String, Object?> json) =>
      _$AdminCreateProductCategoryFromJson(json);

  /// The product category's name.
  final String name;

  /// The product category's description.
  final String? description;

  /// The product category's handle.
  final String? handle;

  /// Whether the product category is only used and seen by admin users.
  @JsonKey(name: 'is_internal')
  final bool? isInternal;

  /// Whether the product category is active.
  @JsonKey(name: 'is_active')
  final bool? isActive;

  /// The ID of a category that's the parent of this one.
  @JsonKey(name: 'parent_category_id')
  final String? parentCategoryId;

  /// The sorting order of the product category among sibling categories.
  final num? rank;

  /// The product category's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The ID of the product category in an external or third-party system.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$AdminCreateProductCategoryToJson(this);
}
