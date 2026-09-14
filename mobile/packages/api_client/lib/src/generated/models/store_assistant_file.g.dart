// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_file.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantFile _$StoreAssistantFileFromJson(Map<String, dynamic> json) =>
    StoreAssistantFile(
      mimeType: json['mime_type'] as String,
      data: json['data'] as String,
      name: json['name'] as String?,
    );

Map<String, dynamic> _$StoreAssistantFileToJson(StoreAssistantFile instance) =>
    <String, dynamic>{
      'mime_type': instance.mimeType,
      'data': instance.data,
      'name': ?instance.name,
    };
