// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum AdminOrderAssigneeRole {
  @JsonValue('picker')
  picker('picker'),

  /// The name has been replaced because it contains a keyword. Original name: `operator`.
  @JsonValue('operator')
  valueOperator('operator'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminOrderAssigneeRole(this.json);

  factory AdminOrderAssigneeRole.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminOrderAssigneeRole> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
