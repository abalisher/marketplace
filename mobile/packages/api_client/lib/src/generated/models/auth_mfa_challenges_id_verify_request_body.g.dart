// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_mfa_challenges_id_verify_request_body.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthMfaChallengesIdVerifyRequestBody
_$AuthMfaChallengesIdVerifyRequestBodyFromJson(Map<String, dynamic> json) =>
    AuthMfaChallengesIdVerifyRequestBody(
      method: json['method'] as String,
      code: json['code'] as String,
    );

Map<String, dynamic> _$AuthMfaChallengesIdVerifyRequestBodyToJson(
  AuthMfaChallengesIdVerifyRequestBody instance,
) => <String, dynamic>{'method': instance.method, 'code': instance.code};
