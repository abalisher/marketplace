// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_translation.dart';

part 'admin_product_type.g.dart';

/// The product type's details.
@JsonSerializable()
class AdminProductType {
  const AdminProductType({
    required this.id,
    required this.value,
    required this.createdAt,
    required this.updatedAt,
    this.deletedAt,
    this.metadata,
    this.translations,
    this.externalId,
  });

  factory AdminProductType.fromJson(Map<String, Object?> json) =>
      _$AdminProductTypeFromJson(json);

  /// The type's ID.
  final String id;

  /// The type's value.
  final String value;

  /// The date the type was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the type was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the type was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The type's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The type's translations.
  final List<AdminTranslation>? translations;

  /// The type's external ID used for integration with third-party systems.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$AdminProductTypeToJson(this);
}
