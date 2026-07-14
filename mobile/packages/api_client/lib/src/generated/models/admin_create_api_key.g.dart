// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_api_key.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateApiKey _$AdminCreateApiKeyFromJson(Map<String, dynamic> json) =>
    AdminCreateApiKey(
      title: json['title'] as String,
      type: AdminCreateApiKeyType.fromJson(json['type'] as String),
    );

Map<String, dynamic> _$AdminCreateApiKeyToJson(AdminCreateApiKey instance) =>
    <String, dynamic>{
      'title': instance.title,
      'type': _$AdminCreateApiKeyTypeEnumMap[instance.type]!,
    };

const _$AdminCreateApiKeyTypeEnumMap = {
  AdminCreateApiKeyType.publishable: 'publishable',
  AdminCreateApiKeyType.secret: 'secret',
  AdminCreateApiKeyType.$unknown: r'$unknown',
};
