// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'statistics.dart';

part 'admin_translation_statistics_response.g.dart';

/// The translation statistics details.
@JsonSerializable()
class AdminTranslationStatisticsResponse {
  const AdminTranslationStatisticsResponse({required this.statistics});

  factory AdminTranslationStatisticsResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminTranslationStatisticsResponseFromJson(json);

  /// The translation statistics for different entity types. The key is the entity type, and the value is an object containing the statistics for that entity type.
  final Map<String, Statistics> statistics;

  Map<String, Object?> toJson() =>
      _$AdminTranslationStatisticsResponseToJson(this);
}
