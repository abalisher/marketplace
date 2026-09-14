// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum StorePhoneAuthErrorReason {
  @JsonValue('invalid_phone')
  invalidPhone('invalid_phone'),
  @JsonValue('too_many_requests')
  tooManyRequests('too_many_requests'),
  @JsonValue('invalid_code')
  invalidCode('invalid_code'),
  @JsonValue('code_expired')
  codeExpired('code_expired'),
  @JsonValue('too_many_attempts')
  tooManyAttempts('too_many_attempts'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const StorePhoneAuthErrorReason(this.json);

  factory StorePhoneAuthErrorReason.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<StorePhoneAuthErrorReason> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
