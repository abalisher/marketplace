// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_phone_auth_error_reason.dart';

part 'store_phone_auth_error.g.dart';

@JsonSerializable()
class StorePhoneAuthError {
  const StorePhoneAuthError({
    required this.reason,
    required this.message,
    this.retryAfter,
  });

  factory StorePhoneAuthError.fromJson(Map<String, Object?> json) =>
      _$StorePhoneAuthErrorFromJson(json);

  final StorePhoneAuthErrorReason reason;
  final String message;

  /// Только для too_many_requests: через сколько секунд повторить запрос кода.
  @JsonKey(name: 'retry_after')
  final int? retryAfter;

  Map<String, Object?> toJson() => _$StorePhoneAuthErrorToJson(this);
}
