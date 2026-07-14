// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_region.dart';

part 'get_store_regions_response.g.dart';

@JsonSerializable()
class GetStoreRegionsResponse {
  const GetStoreRegionsResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.regions,
  });

  factory GetStoreRegionsResponse.fromJson(Map<String, Object?> json) =>
      _$GetStoreRegionsResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The list of regions.
  final List<StoreRegion> regions;

  Map<String, Object?> toJson() => _$GetStoreRegionsResponseToJson(this);
}
