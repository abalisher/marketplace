// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_api_key.g.dart';

/// The details to update in an API key.
@JsonSerializable()
class AdminUpdateApiKey {
  const AdminUpdateApiKey({required this.title});

  factory AdminUpdateApiKey.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateApiKeyFromJson(json);

  /// The API key's title.
  final String title;

  Map<String, Object?> toJson() => _$AdminUpdateApiKeyToJson(this);
}
