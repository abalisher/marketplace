// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_revoke_api_key.g.dart';

/// The details of revoking the API key.
@JsonSerializable()
class AdminRevokeApiKey {
  const AdminRevokeApiKey({this.revokeIn});

  factory AdminRevokeApiKey.fromJson(Map<String, Object?> json) =>
      _$AdminRevokeApiKeyFromJson(json);

  /// The time in seconds to revoke the API key after. If not set, the API key is revoked immediately.
  @JsonKey(name: 'revoke_in')
  final num? revokeIn;

  Map<String, Object?> toJson() => _$AdminRevokeApiKeyToJson(this);
}
