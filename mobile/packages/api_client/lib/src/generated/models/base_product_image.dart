// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_product_image.g.dart';

/// The image's details.
@JsonSerializable()
class BaseProductImage {
  const BaseProductImage({
    required this.id,
    required this.url,
    required this.rank,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.metadata,
  });

  factory BaseProductImage.fromJson(Map<String, Object?> json) =>
      _$BaseProductImageFromJson(json);

  /// The image's ID.
  final String id;

  /// The image's URL.
  final String url;

  /// The date the image was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the image was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The date the image was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The image's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The image's rank among its sibling images.
  final num rank;

  Map<String, Object?> toJson() => _$BaseProductImageToJson(this);
}
