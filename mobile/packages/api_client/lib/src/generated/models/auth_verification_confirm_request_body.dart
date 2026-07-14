// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'auth_verification_confirm_request_body.g.dart';

@JsonSerializable()
class AuthVerificationConfirmRequestBody {
  const AuthVerificationConfirmRequestBody({
    required this.code,
    this.codeProvider,
  });

  factory AuthVerificationConfirmRequestBody.fromJson(
    Map<String, Object?> json,
  ) => _$AuthVerificationConfirmRequestBodyFromJson(json);

  /// The token, OTP, or any other code that was sent to the customer for verification.
  final String code;

  /// The provider to use for verification. This is optional. When not provided, the default `token` provider is used.
  @JsonKey(name: 'code_provider')
  final String? codeProvider;

  Map<String, Object?> toJson() =>
      _$AuthVerificationConfirmRequestBodyToJson(this);
}
