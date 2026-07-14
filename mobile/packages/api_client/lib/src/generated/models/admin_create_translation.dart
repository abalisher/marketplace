// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_translation.g.dart';

/// The translation's details.
@JsonSerializable()
class AdminCreateTranslation {
  const AdminCreateTranslation({
    required this.reference,
    required this.referenceId,
    required this.localeCode,
    required this.translations,
  });

  factory AdminCreateTranslation.fromJson(Map<String, Object?> json) =>
      _$AdminCreateTranslationFromJson(json);

  /// The resource that the translation belongs to.
  final String reference;

  /// The ID of the resource that the translation belongs to. For example, the ID of a product.
  @JsonKey(name: 'reference_id')
  final String referenceId;

  /// The translation's locale code in BCP 47 format.
  @JsonKey(name: 'locale_code')
  final String localeCode;

  /// The translation key-value pairs. Each key is a field in the resource, and the value is the translated text.
  final dynamic translations;

  Map<String, Object?> toJson() => _$AdminCreateTranslationToJson(this);
}
