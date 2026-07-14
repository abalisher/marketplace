// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_price_rule_operator_enum.dart';

part 'store_price_rule.g.dart';

/// The price rule's details.
@JsonSerializable()
class StorePriceRule {
  const StorePriceRule({
    required this.id,
    required this.attribute,
    required this.operatorEnum,
    required this.value,
  });

  factory StorePriceRule.fromJson(Map<String, Object?> json) =>
      _$StorePriceRuleFromJson(json);

  /// The price rule's ID.
  final String id;

  /// The price rule's attribute.
  final String attribute;

  /// The price rule's operator.
  /// The name has been replaced because it contains a keyword. Original name: `operator`.
  @JsonKey(name: 'operator')
  final StorePriceRuleOperatorEnum operatorEnum;

  /// The price rule's value.
  final String value;

  Map<String, Object?> toJson() => _$StorePriceRuleToJson(this);
}
