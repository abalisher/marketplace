// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price.dart';

part 'admin_price_list_price_list_response.g.dart';

/// The list of prices associated with a price list.
@JsonSerializable()
class AdminPriceListPriceListResponse {
  const AdminPriceListPriceListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.prices,
    this.estimateCount,
  });

  factory AdminPriceListPriceListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminPriceListPriceListResponseFromJson(json);

  /// The maximum number of prices to return.
  final num limit;

  /// The number of items skipped before retrieving the prices.
  final num offset;

  /// The maximum number of prices available.
  final num count;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  /// The list of prices associated with the price list.
  final List<AdminPrice> prices;

  Map<String, Object?> toJson() =>
      _$AdminPriceListPriceListResponseToJson(this);
}
