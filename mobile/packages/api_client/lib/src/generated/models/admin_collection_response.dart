// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_collection.dart';

part 'admin_collection_response.g.dart';

/// The collection's details.
@JsonSerializable()
class AdminCollectionResponse {
  const AdminCollectionResponse({required this.collection});

  factory AdminCollectionResponse.fromJson(Map<String, Object?> json) =>
      _$AdminCollectionResponseFromJson(json);

  final AdminCollection collection;

  Map<String, Object?> toJson() => _$AdminCollectionResponseToJson(this);
}
