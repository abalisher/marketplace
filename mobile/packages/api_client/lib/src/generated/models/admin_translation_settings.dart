// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_translation_settings.g.dart';

/// The translation settings details.
@JsonSerializable()
class AdminTranslationSettings {
  const AdminTranslationSettings({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    required this.entityType,
    required this.fields,
    required this.isActive,
  });

  factory AdminTranslationSettings.fromJson(Map<String, Object?> json) =>
      _$AdminTranslationSettingsFromJson(json);

  /// The ID of the translation settings.
  final String id;

  /// The date the translation settings was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the translation settings was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the translation settings was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The entity type the translation settings are for.
  @JsonKey(name: 'entity_type')
  final String entityType;

  /// The fields supported for translations.
  final List<String> fields;

  /// Whether translations are active for the given entity type.
  @JsonKey(name: 'is_active')
  final bool isActive;

  Map<String, Object?> toJson() => _$AdminTranslationSettingsToJson(this);
}
