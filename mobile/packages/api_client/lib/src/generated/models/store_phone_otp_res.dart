// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_phone_otp_res.g.dart';

@JsonSerializable()
class StorePhoneOtpRes {
  const StorePhoneOtpRes({
    required this.phone,
    required this.expiresIn,
    required this.resendAfter,
    this.devCode,
  });

  factory StorePhoneOtpRes.fromJson(Map<String, Object?> json) =>
      _$StorePhoneOtpResFromJson(json);

  /// Номер в каноне +7XXXXXXXXXX.
  final String phone;

  /// Сколько секунд живёт код.
  @JsonKey(name: 'expires_in')
  final int expiresIn;

  /// Через сколько секунд можно запросить код заново.
  @JsonKey(name: 'resend_after')
  final int resendAfter;

  /// Код открытым текстом — только dev-канал стенда (в проде null).
  @JsonKey(name: 'dev_code')
  final String? devCode;

  Map<String, Object?> toJson() => _$StorePhoneOtpResToJson(this);
}
