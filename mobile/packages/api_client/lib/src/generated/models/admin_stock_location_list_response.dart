// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_stock_location.dart';

part 'admin_stock_location_list_response.g.dart';

/// The paginated list of stock locations.
@JsonSerializable()
class AdminStockLocationListResponse {
  const AdminStockLocationListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.stockLocations,
    this.estimateCount,
  });

  factory AdminStockLocationListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminStockLocationListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of stock locations.
  @JsonKey(name: 'stock_locations')
  final List<AdminStockLocation> stockLocations;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() => _$AdminStockLocationListResponseToJson(this);
}
