// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_collection.dart';

part 'store_collection_response.g.dart';

/// The collection's details.
@JsonSerializable()
class StoreCollectionResponse {
  const StoreCollectionResponse({required this.collection});

  factory StoreCollectionResponse.fromJson(Map<String, Object?> json) =>
      _$StoreCollectionResponseFromJson(json);

  final StoreCollection collection;

  Map<String, Object?> toJson() => _$StoreCollectionResponseToJson(this);
}
