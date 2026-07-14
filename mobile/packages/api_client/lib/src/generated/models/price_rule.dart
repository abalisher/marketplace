// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'price_rule_operator_enum.dart';

part 'price_rule.g.dart';

/// The price rule's details.
@JsonSerializable()
class PriceRule {
  const PriceRule({
    required this.attribute,
    required this.operatorEnum,
    required this.value,
  });

  factory PriceRule.fromJson(Map<String, Object?> json) =>
      _$PriceRuleFromJson(json);

  /// The rule's attribute.
  final String attribute;

  /// The rule's operator.
  /// The name has been replaced because it contains a keyword. Original name: `operator`.
  @JsonKey(name: 'operator')
  final PriceRuleOperatorEnum operatorEnum;

  /// The rule's value.
  final num value;

  Map<String, Object?> toJson() => _$PriceRuleToJson(this);
}
