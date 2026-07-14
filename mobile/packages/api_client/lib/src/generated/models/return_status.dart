// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The return's status.
@JsonEnum()
enum ReturnStatus {
  @JsonValue('canceled')
  canceled('canceled'),
  @JsonValue('requested')
  requested('requested'),
  @JsonValue('received')
  received('received'),
  @JsonValue('partially_received')
  partiallyReceived('partially_received'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const ReturnStatus(this.json);

  factory ReturnStatus.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<ReturnStatus> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
