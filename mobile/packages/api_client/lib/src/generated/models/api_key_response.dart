// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'api_key_response_type.dart';

part 'api_key_response.g.dart';

/// The API key's details.
@JsonSerializable()
class ApiKeyResponse {
  const ApiKeyResponse({
    required this.id,
    required this.token,
    required this.redacted,
    required this.title,
    required this.type,
    required this.lastUsedAt,
    required this.createdBy,
    required this.createdAt,
    required this.revokedBy,
    required this.revokedAt,
  });

  factory ApiKeyResponse.fromJson(Map<String, Object?> json) =>
      _$ApiKeyResponseFromJson(json);

  /// The API key's ID.
  final String id;

  /// The API key's token.
  final String token;

  /// The redacted form of the API key's token. This is useful when showing portion of the token. For example `sk_...123`.
  final String redacted;

  /// The API key's title.
  final String title;

  /// The API key's type. `secret` API keys are used for authenticating admin users, and `publishable` API key are used for storefronts and similar clients to scope requests to sales channels.
  final ApiKeyResponseType type;

  /// The date the API key was last used.
  @JsonKey(name: 'last_used_at')
  final DateTime lastUsedAt;

  /// The ID of the user that created the API key.
  @JsonKey(name: 'created_by')
  final String createdBy;

  /// The date the API key was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The ID of the user that revoked the API key.
  @JsonKey(name: 'revoked_by')
  final String revokedBy;

  /// The date the API key was revoked.
  @JsonKey(name: 'revoked_at')
  final DateTime revokedAt;

  Map<String, Object?> toJson() => _$ApiKeyResponseToJson(this);
}
