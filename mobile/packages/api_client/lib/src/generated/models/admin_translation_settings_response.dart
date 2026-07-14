// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_translation_settings_response.g.dart';

/// The translation settings' details.
@JsonSerializable()
class AdminTranslationSettingsResponse {
  const AdminTranslationSettingsResponse({required this.translationSettings});

  factory AdminTranslationSettingsResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminTranslationSettingsResponseFromJson(json);

  /// The translation settings details.
  @JsonKey(name: 'translation_settings')
  final dynamic translationSettings;

  Map<String, Object?> toJson() =>
      _$AdminTranslationSettingsResponseToJson(this);
}
