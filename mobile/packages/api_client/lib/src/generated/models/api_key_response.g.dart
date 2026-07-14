// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'api_key_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ApiKeyResponse _$ApiKeyResponseFromJson(Map<String, dynamic> json) =>
    ApiKeyResponse(
      id: json['id'] as String,
      token: json['token'] as String,
      redacted: json['redacted'] as String,
      title: json['title'] as String,
      type: ApiKeyResponseType.fromJson(json['type'] as String),
      lastUsedAt: DateTime.parse(json['last_used_at'] as String),
      createdBy: json['created_by'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      revokedBy: json['revoked_by'] as String,
      revokedAt: DateTime.parse(json['revoked_at'] as String),
    );

Map<String, dynamic> _$ApiKeyResponseToJson(ApiKeyResponse instance) =>
    <String, dynamic>{
      'id': instance.id,
      'token': instance.token,
      'redacted': instance.redacted,
      'title': instance.title,
      'type': _$ApiKeyResponseTypeEnumMap[instance.type]!,
      'last_used_at': instance.lastUsedAt.toIso8601String(),
      'created_by': instance.createdBy,
      'created_at': instance.createdAt.toIso8601String(),
      'revoked_by': instance.revokedBy,
      'revoked_at': instance.revokedAt.toIso8601String(),
    };

const _$ApiKeyResponseTypeEnumMap = {
  ApiKeyResponseType.secret: 'secret',
  ApiKeyResponseType.publishable: 'publishable',
  ApiKeyResponseType.$unknown: r'$unknown',
};
