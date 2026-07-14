// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_user.dart';

part 'auth_admin_session_response.g.dart';

/// The authenticated user's details.
@JsonSerializable()
class AuthAdminSessionResponse {
  const AuthAdminSessionResponse({required this.user});

  factory AuthAdminSessionResponse.fromJson(Map<String, Object?> json) =>
      _$AuthAdminSessionResponseFromJson(json);

  /// The logged-in user.
  final AdminUser user;

  Map<String, Object?> toJson() => _$AuthAdminSessionResponseToJson(this);
}
