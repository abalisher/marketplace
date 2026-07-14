// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_translation.g.dart';

/// The translation's details.
@JsonSerializable()
class AdminTranslation {
  const AdminTranslation({
    required this.id,
    required this.referenceId,
    required this.reference,
    required this.localeCode,
    required this.translations,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminTranslation.fromJson(Map<String, Object?> json) =>
      _$AdminTranslationFromJson(json);

  /// The translation's ID.
  final String id;

  /// The ID of the resource that the translation belongs to. For example, the ID of a product.
  @JsonKey(name: 'reference_id')
  final String referenceId;

  /// The resource that the translation belongs to.
  final String reference;

  /// The translation's locale code in BCP 47 format.
  @JsonKey(name: 'locale_code')
  final String localeCode;

  /// The translation key-value pairs. Each key is a field in the resource, and the value is the translated text.
  final dynamic translations;

  /// The date that the translation was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date that the translation was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date that the translation was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$AdminTranslationToJson(this);
}
