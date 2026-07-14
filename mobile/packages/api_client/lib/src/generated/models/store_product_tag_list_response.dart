// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product_tag.dart';

part 'store_product_tag_list_response.g.dart';

/// The paginated list of product tags.
@JsonSerializable()
class StoreProductTagListResponse {
  const StoreProductTagListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.productTags,
    this.estimateCount,
  });

  factory StoreProductTagListResponse.fromJson(Map<String, Object?> json) =>
      _$StoreProductTagListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items to skip before retrieving the returned items.
  final num offset;

  /// The total number of items available.
  final num count;

  /// The list of product tags.
  @JsonKey(name: 'product_tags')
  final List<StoreProductTag> productTags;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() => _$StoreProductTagListResponseToJson(this);
}
