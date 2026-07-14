// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product_category.dart';

part 'store_product_category_list_response.g.dart';

/// The paginated list of product categories.
@JsonSerializable()
class StoreProductCategoryListResponse {
  const StoreProductCategoryListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.productCategories,
    this.estimateCount,
  });

  factory StoreProductCategoryListResponse.fromJson(
    Map<String, Object?> json,
  ) => _$StoreProductCategoryListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of product categories.
  @JsonKey(name: 'product_categories')
  final List<StoreProductCategory> productCategories;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() =>
      _$StoreProductCategoryListResponseToJson(this);
}
