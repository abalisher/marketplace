// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_collection.dart';

part 'admin_collection_list_response.g.dart';

/// The paginated list of product collections.
@JsonSerializable()
class AdminCollectionListResponse {
  const AdminCollectionListResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.collections,
    this.estimateCount,
  });

  factory AdminCollectionListResponse.fromJson(Map<String, Object?> json) =>
      _$AdminCollectionListResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned results.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of product collections.
  final List<AdminCollection> collections;

  /// The estimated count retrieved from the PostgreSQL query planner, which may be inaccurate.
  @JsonKey(name: 'estimate_count')
  final num? estimateCount;

  Map<String, Object?> toJson() => _$AdminCollectionListResponseToJson(this);
}
