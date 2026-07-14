// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_translation_statistics_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTranslationStatisticsResponse _$AdminTranslationStatisticsResponseFromJson(
  Map<String, dynamic> json,
) => AdminTranslationStatisticsResponse(
  statistics: (json['statistics'] as Map<String, dynamic>).map(
    (k, e) => MapEntry(k, Statistics.fromJson(e as Map<String, dynamic>)),
  ),
);

Map<String, dynamic> _$AdminTranslationStatisticsResponseToJson(
  AdminTranslationStatisticsResponse instance,
) => <String, dynamic>{'statistics': instance.statistics};
