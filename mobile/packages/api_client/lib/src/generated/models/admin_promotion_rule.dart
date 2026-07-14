// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_promotion_rule_operator_enum.dart';
import 'base_promotion_rule_value.dart';

part 'admin_promotion_rule.g.dart';

/// The promotion rule's details.
@JsonSerializable()
class AdminPromotionRule {
  const AdminPromotionRule({
    required this.id,
    required this.values,
    this.description,
    this.attribute,
    this.operatorEnum,
  });

  factory AdminPromotionRule.fromJson(Map<String, Object?> json) =>
      _$AdminPromotionRuleFromJson(json);

  /// The promotion rule's ID.
  final String id;

  /// The promotion rule's description.
  final String? description;

  /// The promotion rule's attribute.
  final String? attribute;

  /// The rule's operator.
  /// The name has been replaced because it contains a keyword. Original name: `operator`.
  @JsonKey(name: 'operator')
  final AdminPromotionRuleOperatorEnum? operatorEnum;

  /// The rule's values.
  final List<BasePromotionRuleValue> values;

  Map<String, Object?> toJson() => _$AdminPromotionRuleToJson(this);
}
