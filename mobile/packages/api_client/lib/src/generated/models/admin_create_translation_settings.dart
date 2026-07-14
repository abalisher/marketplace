// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_translation_settings.g.dart';

/// The translation settings to create.
@JsonSerializable()
class AdminCreateTranslationSettings {
  const AdminCreateTranslationSettings({
    required this.entityType,
    required this.fields,
    this.isActive,
  });

  factory AdminCreateTranslationSettings.fromJson(Map<String, Object?> json) =>
      _$AdminCreateTranslationSettingsFromJson(json);

  /// The entity type to create the translation settings for.
  @JsonKey(name: 'entity_type')
  final String entityType;

  /// The fields to support translations for.
  final List<String> fields;

  /// Whether translations are active for the given entity type.
  @JsonKey(name: 'is_active')
  final bool? isActive;

  Map<String, Object?> toJson() => _$AdminCreateTranslationSettingsToJson(this);
}
