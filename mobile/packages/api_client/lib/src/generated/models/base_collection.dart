// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_collection.g.dart';

/// The product collection's details.
@JsonSerializable()
class BaseCollection {
  const BaseCollection({
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

  factory BaseCollection.fromJson(Map<String, Object?> json) =>
      _$BaseCollectionFromJson(json);

  /// The collection's ID.
  final String id;

  /// The collection's title.
  final String title;

  /// The collection's handle.
  final String handle;

  /// The collection's creation date.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The collection's update date.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The collection's deletion date.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The collection's products.
  final List<dynamic>? products;

  /// The collection's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The collection's external ID used to link it with external systems.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$BaseCollectionToJson(this);
}
