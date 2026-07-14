// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_translation_settings.g.dart';

/// The translation settings to update.
@JsonSerializable()
class AdminUpdateTranslationSettings {
  const AdminUpdateTranslationSettings({
    required this.id,
    this.entityType,
    this.fields,
    this.isActive,
  });

  factory AdminUpdateTranslationSettings.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateTranslationSettingsFromJson(json);

  /// The ID of the translation settings to update.
  final String id;

  /// The entity type to update the translation settings for.
  @JsonKey(name: 'entity_type')
  final String? entityType;

  /// The fields to update translations for.
  final List<String>? fields;

  /// Whether translations are active for the given entity type.
  @JsonKey(name: 'is_active')
  final bool? isActive;

  Map<String, Object?> toJson() => _$AdminUpdateTranslationSettingsToJson(this);
}
