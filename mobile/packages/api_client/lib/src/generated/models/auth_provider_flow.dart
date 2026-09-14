// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The authentication flow the provider uses:.
///
/// - `credentials`: the client submits credentials (for example, email and.
/// password) directly to the authentication route.
/// - `redirect`: the client is redirected to the provider (for example, an.
/// OIDC identity provider) and returns through a callback.
///
/// A frontend can use this to decide whether to render a credentials form or a.
/// "Continue with ..." redirect button.
@JsonEnum()
enum AuthProviderFlow {
  @JsonValue('credentials')
  credentials('credentials'),
  @JsonValue('redirect')
  redirect('redirect'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AuthProviderFlow(this.json);

  factory AuthProviderFlow.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AuthProviderFlow> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
