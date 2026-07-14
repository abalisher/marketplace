// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_shipping_option_rule_operator_enum.dart';

part 'admin_create_shipping_option_rule.g.dart';

/// The details of the shipping option rule.
@JsonSerializable()
class AdminCreateShippingOptionRule {
  const AdminCreateShippingOptionRule({
    required this.operatorEnum,
    required this.attribute,
    required this.value,
  });

  factory AdminCreateShippingOptionRule.fromJson(Map<String, Object?> json) =>
      _$AdminCreateShippingOptionRuleFromJson(json);

  /// The operator used to check whether a rule applies.
  /// The name has been replaced because it contains a keyword. Original name: `operator`.
  @JsonKey(name: 'operator')
  final AdminCreateShippingOptionRuleOperatorEnum operatorEnum;

  /// The name of a property or table that the rule applies to.
  final String attribute;
  final dynamic value;

  Map<String, Object?> toJson() => _$AdminCreateShippingOptionRuleToJson(this);
}
