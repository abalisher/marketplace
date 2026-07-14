// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_mfa_factors_request_body.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthMfaFactorsRequestBody _$AuthMfaFactorsRequestBodyFromJson(
  Map<String, dynamic> json,
) => AuthMfaFactorsRequestBody(
  provider: json['provider'] as String,
  label: json['label'] as String?,
  issuer: json['issuer'] as String?,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AuthMfaFactorsRequestBodyToJson(
  AuthMfaFactorsRequestBody instance,
) => <String, dynamic>{
  'provider': instance.provider,
  'label': instance.label,
  'issuer': instance.issuer,
  'metadata': instance.metadata,
};
