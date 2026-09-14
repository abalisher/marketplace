// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'auth_provider.dart';

part 'auth_providers_list_response.g.dart';

/// The response of listing the auth providers available.
@JsonSerializable()
class AuthProvidersListResponse {
  const AuthProvidersListResponse({required this.providers});

  factory AuthProvidersListResponse.fromJson(Map<String, Object?> json) =>
      _$AuthProvidersListResponseFromJson(json);

  /// The list of auth providers.
  final List<AuthProvider> providers;

  Map<String, Object?> toJson() => _$AuthProvidersListResponseToJson(this);
}
