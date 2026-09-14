// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_mfa_factors_id_request_body.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthMfaFactorsIdRequestBody _$AuthMfaFactorsIdRequestBodyFromJson(
  Map<String, dynamic> json,
) => AuthMfaFactorsIdRequestBody(
  method: json['method'] as String?,
  code: json['code'] as String?,
);

Map<String, dynamic> _$AuthMfaFactorsIdRequestBodyToJson(
  AuthMfaFactorsIdRequestBody instance,
) => <String, dynamic>{'method': ?instance.method, 'code': ?instance.code};
