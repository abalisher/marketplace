// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The order change's type.
@JsonEnum()
enum AdminOrderChangeChangeType {
  /// The name has been replaced because it contains a keyword. Original name: `return`.
  @JsonValue('return')
  valueReturn('return'),
  @JsonValue('exchange')
  exchange('exchange'),
  @JsonValue('claim')
  claim('claim'),
  @JsonValue('edit')
  edit('edit'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminOrderChangeChangeType(this.json);

  factory AdminOrderChangeChangeType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminOrderChangeChangeType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
