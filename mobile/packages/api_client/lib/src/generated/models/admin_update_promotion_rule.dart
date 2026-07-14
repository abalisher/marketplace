// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_update_promotion_rule_operator_enum.dart';

part 'admin_update_promotion_rule.g.dart';

/// The properties to update in a buy rule.
@JsonSerializable()
class AdminUpdatePromotionRule {
  const AdminUpdatePromotionRule({
    required this.id,
    required this.values,
    this.operatorEnum,
    this.description,
    this.attribute,
  });

  factory AdminUpdatePromotionRule.fromJson(Map<String, Object?> json) =>
      _$AdminUpdatePromotionRuleFromJson(json);

  /// The buy rule's ID.
  final String id;

  /// The operator used to check whether the buy rule applies on a cart. For example, `eq` means that the cart's value for the specified attribute must match the specified value.
  /// The name has been replaced because it contains a keyword. Original name: `operator`.
  @JsonKey(name: 'operator')
  final AdminUpdatePromotionRuleOperatorEnum? operatorEnum;

  /// The buy rule's description.
  final String? description;

  /// The attribute to compare against when checking whether a promotion can be applied on a cart.
  final String? attribute;
  final dynamic values;

  Map<String, Object?> toJson() => _$AdminUpdatePromotionRuleToJson(this);
}
