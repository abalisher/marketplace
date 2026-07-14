// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_api_key_type.dart';

part 'admin_api_key.g.dart';

/// The API key's details.
@JsonSerializable()
class AdminApiKey {
  const AdminApiKey({
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
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminApiKey.fromJson(Map<String, Object?> json) =>
      _$AdminApiKeyFromJson(json);

  /// The api key's ID.
  final String id;

  /// The api key's token.
  final String token;

  /// The redacted form of the API key's token. This is useful when showing portion of the token.
  final String redacted;

  /// The api key's title.
  final String title;

  /// The api key's type. `secret` is used for a user's API key, whereas `publishable` is used for Publishable API keys.
  final AdminApiKeyType type;

  /// The date and time the API key was last used.
  @JsonKey(name: 'last_used_at')
  final DateTime lastUsedAt;

  /// The ID of the user that created the API key, if available.
  @JsonKey(name: 'created_by')
  final String createdBy;

  /// The date and time the API key was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The ID of the user that revoked the API key, if available.
  @JsonKey(name: 'revoked_by')
  final String revokedBy;

  /// The date and time the API key was revoked. The API key is considered revoked when this property is set.
  @JsonKey(name: 'revoked_at')
  final DateTime revokedAt;

  /// The date the API key was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the API key was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$AdminApiKeyToJson(this);
}
