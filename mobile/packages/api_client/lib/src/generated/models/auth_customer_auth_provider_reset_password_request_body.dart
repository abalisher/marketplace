// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'auth_customer_auth_provider_reset_password_request_body.g.dart';

@JsonSerializable()
class AuthCustomerAuthProviderResetPasswordRequestBody {
  const AuthCustomerAuthProviderResetPasswordRequestBody({
    required this.identifier,
    this.metadata,
  });

  factory AuthCustomerAuthProviderResetPasswordRequestBody.fromJson(
    Map<String, Object?> json,
  ) => _$AuthCustomerAuthProviderResetPasswordRequestBodyFromJson(json);

  /// The customer's identifier for the selected auth provider. For example, for the `emailpass` auth provider, the value is the customer's email.
  final String identifier;

  /// Optional metadata to include with the reset password token generation request.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AuthCustomerAuthProviderResetPasswordRequestBodyToJson(this);
}
