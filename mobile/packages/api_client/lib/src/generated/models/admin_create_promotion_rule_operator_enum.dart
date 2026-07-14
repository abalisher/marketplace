// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The operator used to check whether the buy rule applies on a cart. For example, `eq` means that the cart's value for the specified attribute must match the specified value.
/// The name has been replaced because it contains a keyword. Original name: `operator`.
@JsonEnum()
enum AdminCreatePromotionRuleOperatorEnum {
  @JsonValue('gte')
  gte('gte'),
  @JsonValue('lte')
  lte('lte'),
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

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminCreatePromotionRuleOperatorEnum(this.json);

  factory AdminCreatePromotionRuleOperatorEnum.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminCreatePromotionRuleOperatorEnum> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
