// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_batch_translation_settings_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminBatchTranslationSettingsResponse
_$AdminBatchTranslationSettingsResponseFromJson(
  Map<String, dynamic> json,
) => AdminBatchTranslationSettingsResponse(
  created: (json['created'] as List<dynamic>)
      .map((e) => AdminTranslationSettings.fromJson(e as Map<String, dynamic>))
      .toList(),
  updated: (json['updated'] as List<dynamic>)
      .map((e) => AdminTranslationSettings.fromJson(e as Map<String, dynamic>))
      .toList(),
  deleted: Deleted4.fromJson(json['deleted'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminBatchTranslationSettingsResponseToJson(
  AdminBatchTranslationSettingsResponse instance,
) => <String, dynamic>{
  'created': instance.created,
  'updated': instance.updated,
  'deleted': instance.deleted,
};
