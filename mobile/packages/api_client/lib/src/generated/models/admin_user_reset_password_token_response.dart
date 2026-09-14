// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_user_reset_password_token_response.g.dart';

/// The response for the reset password token generation for a user. This response contains the generated reset password token that can be used to reset the user's password.
@JsonSerializable()
class AdminUserResetPasswordTokenResponse {
  const AdminUserResetPasswordTokenResponse({required this.token});

  factory AdminUserResetPasswordTokenResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminUserResetPasswordTokenResponseFromJson(json);

  /// The generated reset password token. Append it to the admin's.
  /// `/reset-password` page as a `token` query parameter to build a link the.
  /// user can open to set a new password.
  ///
  /// The token is short-lived, can only be used once, and generating it.
  /// invalidates any reset password token previously issued for the user.
  final String token;

  Map<String, Object?> toJson() =>
      _$AdminUserResetPasswordTokenResponseToJson(this);
}
