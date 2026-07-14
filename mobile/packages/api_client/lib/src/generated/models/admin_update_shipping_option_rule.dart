// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_update_shipping_option_rule_operator_enum.dart';

part 'admin_update_shipping_option_rule.g.dart';

/// The properties to update in the shipping option rule.
@JsonSerializable()
class AdminUpdateShippingOptionRule {
  const AdminUpdateShippingOptionRule({
    required this.id,
    required this.operatorEnum,
    required this.attribute,
    required this.value,
  });

  factory AdminUpdateShippingOptionRule.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateShippingOptionRuleFromJson(json);

  /// The rule's ID.
  final String id;

  /// The operator used to check whether a rule applies.
  /// The name has been replaced because it contains a keyword. Original name: `operator`.
  @JsonKey(name: 'operator')
  final AdminUpdateShippingOptionRuleOperatorEnum operatorEnum;

  /// The name of a property or table that the rule applies to.
  final String attribute;
  final dynamic value;

  Map<String, Object?> toJson() => _$AdminUpdateShippingOptionRuleToJson(this);
}
