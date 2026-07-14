// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The API key's type. `secret` API keys are used for authenticating admin users, and `publishable` API key are used for storefronts and similar clients to scope requests to sales channels.
@JsonEnum()
enum ApiKeyResponseType {
  @JsonValue('secret')
  secret('secret'),
  @JsonValue('publishable')
  publishable('publishable'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const ApiKeyResponseType(this.json);

  factory ApiKeyResponseType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<ApiKeyResponseType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
