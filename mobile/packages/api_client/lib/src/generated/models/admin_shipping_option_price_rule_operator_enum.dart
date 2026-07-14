// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The price rule's operator.
/// The name has been replaced because it contains a keyword. Original name: `operator`.
@JsonEnum()
enum AdminShippingOptionPriceRuleOperatorEnum {
  @JsonValue('gt')
  gt('gt'),
  @JsonValue('lt')
  lt('lt'),
  @JsonValue('eq')
  eq('eq'),
  @JsonValue('ne')
  ne('ne'),

  /// The name has been replaced because it contains a keyword. Original name: `in`.
  @JsonValue('in')
  valueIn('in'),
  @JsonValue('lte')
  lte('lte'),
  @JsonValue('gte')
  gte('gte'),
  @JsonValue('nin')
  nin('nin'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminShippingOptionPriceRuleOperatorEnum(this.json);

  factory AdminShippingOptionPriceRuleOperatorEnum.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminShippingOptionPriceRuleOperatorEnum> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
