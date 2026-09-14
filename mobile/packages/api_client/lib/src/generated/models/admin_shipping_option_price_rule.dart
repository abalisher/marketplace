// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_shipping_option_price_rule_operator_enum.dart';

part 'admin_shipping_option_price_rule.g.dart';

/// The details of a shipping option price's rule.
@JsonSerializable()
class AdminShippingOptionPriceRule {
  const AdminShippingOptionPriceRule({
    required this.id,
    required this.value,
    required this.operatorEnum,
    required this.attribute,
    required this.priceId,
    required this.priority,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminShippingOptionPriceRule.fromJson(Map<String, Object?> json) =>
      _$AdminShippingOptionPriceRuleFromJson(json);

  /// The price rule's ID.
  final String id;

  /// The price rule's value.
  final dynamic value;

  /// The price rule's operator.
  /// The name has been replaced because it contains a keyword. Original name: `operator`.
  @JsonKey(name: 'operator')
  final AdminShippingOptionPriceRuleOperatorEnum operatorEnum;

  /// The price rule's attribute.
  final String attribute;

  /// The ID of the price this rule applies to.
  @JsonKey(name: 'price_id')
  final String priceId;

  /// The price rule's priority.
  final num priority;

  /// The date the price rule was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the price rule was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the price rule was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminShippingOptionPriceRuleToJson(this);
}
