// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product_type.dart';

part 'store_product_type_list_response.g.dart';

/// The paginated list of product types.
@JsonSerializable()
class StoreProductTypeListResponse {
  const StoreProductTypeListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.productTypes,
    this.estimateCount,
  });

  factory StoreProductTypeListResponse.fromJson(Map<String, Object?> json) =>
      _$StoreProductTypeListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items to skip before retrieving the returned items.
  final num offset;

  /// The total number of items available.
  final num count;

  /// The list of product types.
  @JsonKey(name: 'product_types')
  final List<StoreProductType> productTypes;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() => _$StoreProductTypeListResponseToJson(this);
}
