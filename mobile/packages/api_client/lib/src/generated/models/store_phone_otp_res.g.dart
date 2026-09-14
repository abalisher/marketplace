// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_phone_otp_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StorePhoneOtpRes _$StorePhoneOtpResFromJson(Map<String, dynamic> json) =>
    StorePhoneOtpRes(
      phone: json['phone'] as String,
      expiresIn: (json['expires_in'] as num).toInt(),
      resendAfter: (json['resend_after'] as num).toInt(),
      devCode: json['dev_code'] as String?,
    );

Map<String, dynamic> _$StorePhoneOtpResToJson(StorePhoneOtpRes instance) =>
    <String, dynamic>{
      'phone': instance.phone,
      'expires_in': instance.expiresIn,
      'resend_after': instance.resendAfter,
      'dev_code': ?instance.devCode,
    };
