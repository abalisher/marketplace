// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_translation.dart';
import 'deleted6.dart';

part 'admin_translations_batch_response.g.dart';

/// The batch response for managing translations.
@JsonSerializable()
class AdminTranslationsBatchResponse {
  const AdminTranslationsBatchResponse({
    required this.created,
    required this.updated,
    required this.deleted,
  });

  factory AdminTranslationsBatchResponse.fromJson(Map<String, Object?> json) =>
      _$AdminTranslationsBatchResponseFromJson(json);

  /// The created translations.
  final List<AdminTranslation> created;

  /// The updated translations.
  final List<AdminTranslation> updated;

  /// Summary of the deleted translations.
  final Deleted6 deleted;

  Map<String, Object?> toJson() => _$AdminTranslationsBatchResponseToJson(this);
}
