// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'by_locale.dart';

part 'statistics.g.dart';

@JsonSerializable()
class Statistics {
  const Statistics({
    this.byLocale,
    this.expected,
    this.translated,
    this.missing,
  });

  factory Statistics.fromJson(Map<String, Object?> json) =>
      _$StatisticsFromJson(json);

  /// The translation statistics of an entity type broken down by locale. The key is the locale code in BCP 47 format, and the value is an object containing the statistics for that locale.
  @JsonKey(name: 'by_locale')
  final Map<String, ByLocale>? byLocale;

  /// The total number of translatable fields across specified locales.
  final num? expected;

  /// The number of translated fields across specified locales.
  final num? translated;

  /// The number of fields that are yet to be translated across specified locales.
  final num? missing;

  Map<String, Object?> toJson() => _$StatisticsToJson(this);
}
