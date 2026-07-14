// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'auth_mfa_factors_id_request_body.g.dart';

@JsonSerializable()
class AuthMfaFactorsIdRequestBody {
  const AuthMfaFactorsIdRequestBody({this.method, this.code});

  factory AuthMfaFactorsIdRequestBody.fromJson(Map<String, Object?> json) =>
      _$AuthMfaFactorsIdRequestBodyFromJson(json);

  /// The MFA method used to authorize disabling the factor (for example, `recovery-code`).
  final String? method;

  /// The verification code associated with the provided `method`, used to confirm the disable action.
  final String? code;

  Map<String, Object?> toJson() => _$AuthMfaFactorsIdRequestBodyToJson(this);
}
