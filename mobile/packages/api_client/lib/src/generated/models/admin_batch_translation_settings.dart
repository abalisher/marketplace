// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_translation_settings.dart';
import 'admin_update_translation_settings.dart';

part 'admin_batch_translation_settings.g.dart';

/// The translation settings to create, update, or delete in batch.
@JsonSerializable()
class AdminBatchTranslationSettings {
  const AdminBatchTranslationSettings({this.create, this.update, this.delete});

  factory AdminBatchTranslationSettings.fromJson(Map<String, Object?> json) =>
      _$AdminBatchTranslationSettingsFromJson(json);

  /// The translation settings to create.
  final List<AdminCreateTranslationSettings>? create;

  /// The translation settings to update.
  final List<AdminUpdateTranslationSettings>? update;

  /// The translation settings to delete.
  final List<String>? delete;

  Map<String, Object?> toJson() => _$AdminBatchTranslationSettingsToJson(this);
}
