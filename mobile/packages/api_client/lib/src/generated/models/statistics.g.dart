// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'statistics.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Statistics _$StatisticsFromJson(Map<String, dynamic> json) => Statistics(
  byLocale: (json['by_locale'] as Map<String, dynamic>?)?.map(
    (k, e) => MapEntry(k, ByLocale.fromJson(e as Map<String, dynamic>)),
  ),
  expected: json['expected'] as num?,
  translated: json['translated'] as num?,
  missing: json['missing'] as num?,
);

Map<String, dynamic> _$StatisticsToJson(Statistics instance) =>
    <String, dynamic>{
      'by_locale': ?instance.byLocale,
      'expected': ?instance.expected,
      'translated': ?instance.translated,
      'missing': ?instance.missing,
    };
