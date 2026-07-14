// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The api key's type. `secret` is used for a user's API key, whereas `publishable` is used for Publishable API keys.
@JsonEnum()
enum AdminApiKeyType {
  @JsonValue('secret')
  secret('secret'),
  @JsonValue('publishable')
  publishable('publishable'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminApiKeyType(this.json);

  factory AdminApiKeyType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminApiKeyType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
