// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_collection.dart';

part 'get_store_collections_response.g.dart';

@JsonSerializable()
class GetStoreCollectionsResponse {
  const GetStoreCollectionsResponse({
    required this.limit,
    required this.offset,
    required this.count,
    required this.collections,
  });

  factory GetStoreCollectionsResponse.fromJson(Map<String, Object?> json) =>
      _$GetStoreCollectionsResponseFromJson(json);

  /// The maximum number of items returned.
  final num limit;

  /// The number of items skipped before retrieving the returned items.
  final num offset;

  /// The total number of items.
  final num count;

  /// The collection's collections.
  final List<StoreCollection> collections;

  Map<String, Object?> toJson() => _$GetStoreCollectionsResponseToJson(this);
}
