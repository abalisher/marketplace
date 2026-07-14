// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'auth_mfa_recovery_codes_request_body.g.dart';

@JsonSerializable()
class AuthMfaRecoveryCodesRequestBody {
  const AuthMfaRecoveryCodesRequestBody({this.count});

  factory AuthMfaRecoveryCodesRequestBody.fromJson(Map<String, Object?> json) =>
      _$AuthMfaRecoveryCodesRequestBodyFromJson(json);

  /// The number of recovery codes to generate. Must be between 1 and 50. Defaults to the provider's configured value when omitted.
  final num? count;

  Map<String, Object?> toJson() =>
      _$AuthMfaRecoveryCodesRequestBodyToJson(this);
}
