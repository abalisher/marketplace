// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The order change's status.
@JsonEnum()
enum AdminOrderChangeStatus {
  @JsonValue('canceled')
  canceled('canceled'),
  @JsonValue('requested')
  requested('requested'),
  @JsonValue('pending')
  pending('pending'),
  @JsonValue('confirmed')
  confirmed('confirmed'),
  @JsonValue('declined')
  declined('declined'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminOrderChangeStatus(this.json);

  factory AdminOrderChangeStatus.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminOrderChangeStatus> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
