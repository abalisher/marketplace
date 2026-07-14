// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_api_key_type.dart';

part 'admin_create_api_key.g.dart';

/// The API key's details.
@JsonSerializable()
class AdminCreateApiKey {
  const AdminCreateApiKey({required this.title, required this.type});

  factory AdminCreateApiKey.fromJson(Map<String, Object?> json) =>
      _$AdminCreateApiKeyFromJson(json);

  /// The API key's title.
  final String title;

  /// The API key's type. Use `secret` for a user's API key; Use `publishable` for Publishable API keys.
  final AdminCreateApiKeyType type;

  Map<String, Object?> toJson() => _$AdminCreateApiKeyToJson(this);
}
