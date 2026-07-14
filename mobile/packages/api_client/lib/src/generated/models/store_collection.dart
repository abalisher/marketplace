// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_collection.g.dart';

/// The collection's details.
@JsonSerializable()
class StoreCollection {
  const StoreCollection({
    required this.id,
    required this.title,
    required this.handle,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    required this.metadata,
    this.products,
    this.externalId,
  });

  factory StoreCollection.fromJson(Map<String, Object?> json) =>
      _$StoreCollectionFromJson(json);

  /// The collection's ID.
  final String id;

  /// The collection's title.
  final String title;

  /// The collection's handle.
  final String handle;

  /// The date the collection was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the collection was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the collection was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  /// The collection's products.
  final List<dynamic>? products;

  /// The collection's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The collection's external ID used to link it with external systems.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$StoreCollectionToJson(this);
}
