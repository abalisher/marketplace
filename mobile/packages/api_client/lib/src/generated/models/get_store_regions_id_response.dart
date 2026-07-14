// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_region.dart';

part 'get_store_regions_id_response.g.dart';

@JsonSerializable()
class GetStoreRegionsIdResponse {
  const GetStoreRegionsIdResponse({required this.region});

  factory GetStoreRegionsIdResponse.fromJson(Map<String, Object?> json) =>
      _$GetStoreRegionsIdResponseFromJson(json);

  final StoreRegion region;

  Map<String, Object?> toJson() => _$GetStoreRegionsIdResponseToJson(this);
}
