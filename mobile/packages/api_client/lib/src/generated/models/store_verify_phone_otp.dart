// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_verify_phone_otp.g.dart';

@JsonSerializable()
class StoreVerifyPhoneOtp {
  const StoreVerifyPhoneOtp({required this.phone, required this.code});

  factory StoreVerifyPhoneOtp.fromJson(Map<String, Object?> json) =>
      _$StoreVerifyPhoneOtpFromJson(json);

  /// Тот же номер, на который запрашивался код.
  final String phone;

  /// Код из SMS (в dev-канале — из ответа на запрос кода).
  final String code;

  Map<String, Object?> toJson() => _$StoreVerifyPhoneOtpToJson(this);
}
