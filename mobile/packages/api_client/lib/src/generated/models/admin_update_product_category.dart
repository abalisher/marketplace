// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_product_category.g.dart';

/// The properties to update in the product category.
@JsonSerializable()
class AdminUpdateProductCategory {
  const AdminUpdateProductCategory({
    this.name,
    this.description,
    this.handle,
    this.isInternal,
    this.isActive,
    this.parentCategoryId,
    this.metadata,
    this.rank,
    this.externalId,
  });

  factory AdminUpdateProductCategory.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateProductCategoryFromJson(json);

  /// The product category's name.
  final String? name;

  /// The product category's description.
  final String? description;

  /// The product category's handle. Must be a unique value.
  final String? handle;

  /// Whether the product category is only used for internal purposes and shouldn't be shown the customer.
  @JsonKey(name: 'is_internal')
  final bool? isInternal;

  /// Whether the product category is active.
  @JsonKey(name: 'is_active')
  final bool? isActive;

  /// The ID of a parent category.
  @JsonKey(name: 'parent_category_id')
  final String? parentCategoryId;

  /// The product category's metadata. Can hold custom key-value pairs.
  final dynamic metadata;

  /// The product category's rank among other categories.
  final num? rank;

  /// The product category's external ID used to link it with external systems.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$AdminUpdateProductCategoryToJson(this);
}
