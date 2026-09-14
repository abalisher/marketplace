// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_verification_request_request_body.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthVerificationRequestRequestBody _$AuthVerificationRequestRequestBodyFromJson(
  Map<String, dynamic> json,
) => AuthVerificationRequestRequestBody(
  entityId: json['entity_id'] as String,
  entityType: json['entity_type'] as String,
  codeProvider: json['code_provider'] as String,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AuthVerificationRequestRequestBodyToJson(
  AuthVerificationRequestRequestBody instance,
) => <String, dynamic>{
  'entity_id': instance.entityId,
  'entity_type': instance.entityType,
  'code_provider': instance.codeProvider,
  'metadata': ?instance.metadata,
};
