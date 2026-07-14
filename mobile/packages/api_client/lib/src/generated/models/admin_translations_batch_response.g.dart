// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_translations_batch_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTranslationsBatchResponse _$AdminTranslationsBatchResponseFromJson(
  Map<String, dynamic> json,
) => AdminTranslationsBatchResponse(
  created: (json['created'] as List<dynamic>)
      .map((e) => AdminTranslation.fromJson(e as Map<String, dynamic>))
      .toList(),
  updated: (json['updated'] as List<dynamic>)
      .map((e) => AdminTranslation.fromJson(e as Map<String, dynamic>))
      .toList(),
  deleted: Deleted6.fromJson(json['deleted'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminTranslationsBatchResponseToJson(
  AdminTranslationsBatchResponse instance,
) => <String, dynamic>{
  'created': instance.created,
  'updated': instance.updated,
  'deleted': instance.deleted,
};
