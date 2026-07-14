// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_tag.dart';

part 'admin_product_tag_list_response.g.dart';

/// The paginated list of product tags.
@JsonSerializable()
class AdminProductTagListResponse {
  const AdminProductTagListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.productTags,
    this.estimateCount,
  });

  factory AdminProductTagListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductTagListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of product tags.
  @JsonKey(name: 'product_tags')
  final List<AdminProductTag> productTags;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() => _$AdminProductTagListResponseToJson(this);
}
