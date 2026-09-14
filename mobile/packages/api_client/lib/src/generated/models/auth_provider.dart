// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'auth_provider_flow.dart';

part 'auth_provider.g.dart';

/// The public information of a registered auth provider instance. This is safe.
/// to expose to unauthenticated clients and never contains provider options or.
/// secrets.
@JsonSerializable()
class AuthProvider {
  const AuthProvider({
    required this.id,
    required this.identifier,
    required this.displayName,
    required this.flow,
  });

  factory AuthProvider.fromJson(Map<String, Object?> json) =>
      _$AuthProviderFromJson(json);

  /// The registered instance ID of the provider, used in authentication routes.
  /// (for example, `okta` in `POST /auth/user/okta`).
  final String id;

  /// The provider's static identifier (for example, `oidc` or `emailpass`).
  final String identifier;

  /// The name to display for the provider in a frontend application.
  @JsonKey(name: 'display_name')
  final String displayName;

  /// The authentication flow the provider uses:.
  ///
  /// - `credentials`: the client submits credentials (for example, email and.
  /// password) directly to the authentication route.
  /// - `redirect`: the client is redirected to the provider (for example, an.
  /// OIDC identity provider) and returns through a callback.
  ///
  /// A frontend can use this to decide whether to render a credentials form or a.
  /// "Continue with ..." redirect button.
  final AuthProviderFlow flow;

  Map<String, Object?> toJson() => _$AuthProviderToJson(this);
}
