// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product_variant.dart';

part 'get_store_product_variants_response.g.dart';

@JsonSerializable()
class GetStoreProductVariantsResponse {
  const GetStoreProductVariantsResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.variants,
    this.estimateCount,
  });

  factory GetStoreProductVariantsResponse.fromJson(Map<String, Object?> json) =>
      _$GetStoreProductVariantsResponseFromJson(json);

  /// The maximum number of items returned in the list.
  final num limit;

  /// The number of items skipped before the retrieved list.
  final num offset;

  /// The total number of items available.
  final num count;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  /// The list of product variants.
  final List<StoreProductVariant> variants;

  Map<String, Object?> toJson() =>
      _$GetStoreProductVariantsResponseToJson(this);
}
