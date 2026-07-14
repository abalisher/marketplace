// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The rule's operator.
/// The name has been replaced because it contains a keyword. Original name: `operator`.
@JsonEnum()
enum OperatorEnum {
  @JsonValue('gt')
  gt('gt'),
  @JsonValue('lt')
  lt('lt'),
  @JsonValue('eq')
  eq('eq'),
  @JsonValue('lte')
  lte('lte'),
  @JsonValue('gte')
  gte('gte'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const OperatorEnum(this.json);

  factory OperatorEnum.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<OperatorEnum> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
