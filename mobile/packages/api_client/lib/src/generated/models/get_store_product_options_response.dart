// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product_option.dart';

part 'get_store_product_options_response.g.dart';

@JsonSerializable()
class GetStoreProductOptionsResponse {
  const GetStoreProductOptionsResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.productOptions,
    this.estimateCount,
  });

  factory GetStoreProductOptionsResponse.fromJson(Map<String, Object?> json) =>
      _$GetStoreProductOptionsResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  /// The list of product options.
  @JsonKey(name: 'product_options')
  final List<StoreProductOption> productOptions;

  Map<String, Object?> toJson() => _$GetStoreProductOptionsResponseToJson(this);
}
