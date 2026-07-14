// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_translation_entities_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTranslationEntitiesResponse _$AdminTranslationEntitiesResponseFromJson(
  Map<String, dynamic> json,
) => AdminTranslationEntitiesResponse(
  data: (json['data'] as List<dynamic>)
      .map((e) => Data.fromJson(e as Map<String, dynamic>))
      .toList(),
  count: json['count'] as num,
  offset: json['offset'] as num,
  limit: json['limit'] as num,
);

Map<String, dynamic> _$AdminTranslationEntitiesResponseToJson(
  AdminTranslationEntitiesResponse instance,
) => <String, dynamic>{
  'data': instance.data,
  'count': instance.count,
  'offset': instance.offset,
  'limit': instance.limit,
};
