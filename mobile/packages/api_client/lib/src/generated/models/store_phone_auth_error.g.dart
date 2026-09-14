// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_phone_auth_error.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StorePhoneAuthError _$StorePhoneAuthErrorFromJson(Map<String, dynamic> json) =>
    StorePhoneAuthError(
      reason: StorePhoneAuthErrorReason.fromJson(json['reason'] as String),
      message: json['message'] as String,
      retryAfter: (json['retry_after'] as num?)?.toInt(),
    );

Map<String, dynamic> _$StorePhoneAuthErrorToJson(
  StorePhoneAuthError instance,
) => <String, dynamic>{
  'reason': _$StorePhoneAuthErrorReasonEnumMap[instance.reason]!,
  'message': instance.message,
  'retry_after': ?instance.retryAfter,
};

const _$StorePhoneAuthErrorReasonEnumMap = {
  StorePhoneAuthErrorReason.invalidPhone: 'invalid_phone',
  StorePhoneAuthErrorReason.tooManyRequests: 'too_many_requests',
  StorePhoneAuthErrorReason.invalidCode: 'invalid_code',
  StorePhoneAuthErrorReason.codeExpired: 'code_expired',
  StorePhoneAuthErrorReason.tooManyAttempts: 'too_many_attempts',
  StorePhoneAuthErrorReason.$unknown: r'$unknown',
};
