// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_translation_settings.dart';
import 'deleted4.dart';

part 'admin_batch_translation_settings_response.g.dart';

/// The result of managing the translation settings in batch.
@JsonSerializable()
class AdminBatchTranslationSettingsResponse {
  const AdminBatchTranslationSettingsResponse({
    required this.created,
    required this.updated,
    required this.deleted,
  });

  factory AdminBatchTranslationSettingsResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminBatchTranslationSettingsResponseFromJson(json);

  /// The created translation settings.
  final List<AdminTranslationSettings> created;

  /// The updated translation settings.
  final List<AdminTranslationSettings> updated;

  /// The deletion result.
  final Deleted4 deleted;

  Map<String, Object?> toJson() =>
      _$AdminBatchTranslationSettingsResponseToJson(this);
}
