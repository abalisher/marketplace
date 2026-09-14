// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_shipping_option_rule_operator_enum.dart';

part 'admin_shipping_option_rule.g.dart';

/// The shipping option rule's details.
@JsonSerializable()
class AdminShippingOptionRule {
  const AdminShippingOptionRule({
    required this.id,
    required this.attribute,
    required this.operatorEnum,
    required this.value,
    required this.shippingOptionId,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminShippingOptionRule.fromJson(Map<String, Object?> json) =>
      _$AdminShippingOptionRuleFromJson(json);

  /// The shipping option rule's ID.
  final String id;

  /// The shipping option rule's attribute.
  final String attribute;

  /// The rule's operator.
  /// The name has been replaced because it contains a keyword. Original name: `operator`.
  @JsonKey(name: 'operator')
  final AdminShippingOptionRuleOperatorEnum operatorEnum;
  final dynamic value;

  /// The ID of the shipping option this rule is for.
  @JsonKey(name: 'shipping_option_id')
  final String shippingOptionId;

  /// The date the shipping option rule was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the shipping option rule was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the shipping option rule was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminShippingOptionRuleToJson(this);
}
