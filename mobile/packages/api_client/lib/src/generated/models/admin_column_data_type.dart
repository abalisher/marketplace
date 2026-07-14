// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The data type of the column's value.
@JsonEnum()
enum AdminColumnDataType {
  @JsonValue('string')
  string('string'),
  @JsonValue('number')
  number('number'),
  @JsonValue('boolean')
  boolean('boolean'),
  @JsonValue('object')
  object('object'),
  @JsonValue('date')
  date('date'),
  @JsonValue('currency')
  currency('currency'),

  /// The name has been replaced because it contains a keyword. Original name: `enum`.
  @JsonValue('enum')
  valueEnum('enum'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminColumnDataType(this.json);

  factory AdminColumnDataType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminColumnDataType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
