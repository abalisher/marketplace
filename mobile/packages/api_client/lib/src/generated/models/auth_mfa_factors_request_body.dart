// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'auth_mfa_factors_request_body.g.dart';

@JsonSerializable()
class AuthMfaFactorsRequestBody {
  const AuthMfaFactorsRequestBody({
    required this.provider,
    this.label,
    this.issuer,
    this.metadata,
  });

  factory AuthMfaFactorsRequestBody.fromJson(Map<String, Object?> json) =>
      _$AuthMfaFactorsRequestBodyFromJson(json);

  /// The ID of the MFA provider to enroll the factor with (for example, `totp`).
  final String provider;

  /// A human-readable label to identify the factor (for example, the name of the authenticator app or device).
  final String? label;

  /// The issuer name shown in authenticator apps for this factor. Defaults to the application name when omitted.
  final String? issuer;

  /// Additional provider-specific data to associate with the factor.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AuthMfaFactorsRequestBodyToJson(this);
}
