// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_type.dart';

part 'admin_product_type_list_response.g.dart';

/// The paginated list of product types.
@JsonSerializable()
class AdminProductTypeListResponse {
  const AdminProductTypeListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.productTypes,
    this.estimateCount,
  });

  factory AdminProductTypeListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductTypeListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of product types.
  @JsonKey(name: 'product_types')
  final List<AdminProductType> productTypes;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() => _$AdminProductTypeListResponseToJson(this);
}
