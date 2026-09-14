// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_verification_confirm_request_body.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthVerificationConfirmRequestBody _$AuthVerificationConfirmRequestBodyFromJson(
  Map<String, dynamic> json,
) => AuthVerificationConfirmRequestBody(
  code: json['code'] as String,
  codeProvider: json['code_provider'] as String?,
);

Map<String, dynamic> _$AuthVerificationConfirmRequestBodyToJson(
  AuthVerificationConfirmRequestBody instance,
) => <String, dynamic>{
  'code': instance.code,
  'code_provider': ?instance.codeProvider,
};
