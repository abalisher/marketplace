// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_user_auth_providers_response.g.dart';

/// The list of auth providers that a user can authenticate with. These represent the auth providers that the user has previously used to log in or register with the system.
@JsonSerializable()
class AdminUserAuthProvidersResponse {
  const AdminUserAuthProvidersResponse({required this.providers});

  factory AdminUserAuthProvidersResponse.fromJson(Map<String, Object?> json) =>
      _$AdminUserAuthProvidersResponseFromJson(json);

  /// The IDs of the auth providers the user can authenticate with, such as.
  /// `emailpass`.
  final List<String> providers;

  Map<String, Object?> toJson() => _$AdminUserAuthProvidersResponseToJson(this);
}
