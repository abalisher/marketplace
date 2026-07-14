// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_product_tag.g.dart';

/// The tag's details.
@JsonSerializable()
class StoreProductTag {
  const StoreProductTag({
    required this.id,
    required this.value,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    this.metadata,
    this.externalId,
  });

  factory StoreProductTag.fromJson(Map<String, Object?> json) =>
      _$StoreProductTagFromJson(json);

  /// The tag's ID.
  final String id;

  /// The tag's value.
  final String value;

  /// The date the tag was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the tag was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the tag was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The tag's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The tag's external ID used to link it with external systems.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$StoreProductTagToJson(this);
}
