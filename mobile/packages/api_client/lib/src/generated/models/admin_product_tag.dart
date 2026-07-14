// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_translation.dart';

part 'admin_product_tag.g.dart';

/// The product tag's details.
@JsonSerializable()
class AdminProductTag {
  const AdminProductTag({
    required this.id,
    required this.value,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    this.metadata,
    this.translations,
    this.externalId,
  });

  factory AdminProductTag.fromJson(Map<String, Object?> json) =>
      _$AdminProductTagFromJson(json);

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

  /// The tag's translations.
  final List<AdminTranslation>? translations;

  /// The tag's external ID used for integration with third-party systems.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$AdminProductTagToJson(this);
}
