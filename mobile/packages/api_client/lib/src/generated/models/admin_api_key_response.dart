// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_api_key.dart';

part 'admin_api_key_response.g.dart';

/// The API key's details.
@JsonSerializable()
class AdminApiKeyResponse {
  const AdminApiKeyResponse({required this.apiKey});

  factory AdminApiKeyResponse.fromJson(Map<String, Object?> json) =>
      _$AdminApiKeyResponseFromJson(json);

  @JsonKey(name: 'api_key')
  final AdminApiKey apiKey;

  Map<String, Object?> toJson() => _$AdminApiKeyResponseToJson(this);
}
