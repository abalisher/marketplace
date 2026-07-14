// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The API key's type. Use `secret` for a user's API key; Use `publishable` for Publishable API keys.
@JsonEnum()
enum AdminCreateApiKeyType {
  @JsonValue('publishable')
  publishable('publishable'),
  @JsonValue('secret')
  secret('secret'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminCreateApiKeyType(this.json);

  factory AdminCreateApiKeyType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminCreateApiKeyType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
