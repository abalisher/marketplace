// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_request_phone_otp.g.dart';

@JsonSerializable()
class StoreRequestPhoneOtp {
  const StoreRequestPhoneOtp({required this.phone});

  factory StoreRequestPhoneOtp.fromJson(Map<String, Object?> json) =>
      _$StoreRequestPhoneOtpFromJson(json);

  /// Мобильный номер покупателя в любой записи: +77012345678, 8 701 234 56 78, 7012345678.
  final String phone;

  Map<String, Object?> toJson() => _$StoreRequestPhoneOtpToJson(this);
}
