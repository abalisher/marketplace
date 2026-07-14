// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_promotion_rule_operator_enum.dart';

part 'admin_create_promotion_rule.g.dart';

/// The promotion rule's details.
@JsonSerializable()
class AdminCreatePromotionRule {
  const AdminCreatePromotionRule({
    required this.operatorEnum,
    required this.attribute,
    required this.values,
    this.description,
  });

  factory AdminCreatePromotionRule.fromJson(Map<String, Object?> json) =>
      _$AdminCreatePromotionRuleFromJson(json);

  /// The operator used to check whether the buy rule applies on a cart. For example, `eq` means that the cart's value for the specified attribute must match the specified value.
  /// The name has been replaced because it contains a keyword. Original name: `operator`.
  @JsonKey(name: 'operator')
  final AdminCreatePromotionRuleOperatorEnum operatorEnum;

  /// The rule's description.
  final String? description;

  /// The attribute to compare against when checking whether a promotion can be applied on a cart.
  final String attribute;
  final dynamic values;

  Map<String, Object?> toJson() => _$AdminCreatePromotionRuleToJson(this);
}
