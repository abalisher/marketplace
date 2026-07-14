// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_shipping_option_rule_operator_enum.dart';
import 'admin_update_shipping_option_rule_operator_enum.dart';
import 'admin_create_shipping_option_rule.dart';
import 'admin_update_shipping_option_rule.dart';

part 'admin_update_shipping_option_rules_sealed.g.dart';

@JsonSerializable(createFactory: false)
sealed class AdminUpdateShippingOptionRulesSealed {
  const AdminUpdateShippingOptionRulesSealed();

  factory AdminUpdateShippingOptionRulesSealed.fromJson(
    Map<String, dynamic> json,
  ) => AdminUpdateShippingOptionRulesSealedDeserializer.tryDeserialize(json);

  Map<String, dynamic> toJson();
}

extension AdminUpdateShippingOptionRulesSealedDeserializer
    on AdminUpdateShippingOptionRulesSealed {
  static AdminUpdateShippingOptionRulesSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return AdminUpdateShippingOptionRulesSealedAdminCreateShippingOptionRule.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return AdminUpdateShippingOptionRulesSealedAdminUpdateShippingOptionRule.fromJson(
        json,
      );
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for AdminUpdateShippingOptionRulesSealed from: $json',
    );
  }
}

@JsonSerializable()
class AdminUpdateShippingOptionRulesSealedAdminCreateShippingOptionRule
    extends AdminUpdateShippingOptionRulesSealed
    implements AdminCreateShippingOptionRule {
  @override
  final AdminCreateShippingOptionRuleOperatorEnum operatorEnum;
  @override
  final String attribute;
  @override
  final dynamic value;

  const AdminUpdateShippingOptionRulesSealedAdminCreateShippingOptionRule({
    required this.operatorEnum,
    required this.attribute,
    required this.value,
  });

  factory AdminUpdateShippingOptionRulesSealedAdminCreateShippingOptionRule.fromJson(
    Map<String, dynamic> json,
  ) =>
      _$AdminUpdateShippingOptionRulesSealedAdminCreateShippingOptionRuleFromJson(
        json,
      );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminUpdateShippingOptionRulesSealedAdminCreateShippingOptionRuleToJson(
        this,
      );
}

@JsonSerializable()
class AdminUpdateShippingOptionRulesSealedAdminUpdateShippingOptionRule
    extends AdminUpdateShippingOptionRulesSealed
    implements AdminUpdateShippingOptionRule {
  @override
  final String id;
  @override
  final AdminUpdateShippingOptionRuleOperatorEnum operatorEnum;
  @override
  final String attribute;
  @override
  final dynamic value;

  const AdminUpdateShippingOptionRulesSealedAdminUpdateShippingOptionRule({
    required this.id,
    required this.operatorEnum,
    required this.attribute,
    required this.value,
  });

  factory AdminUpdateShippingOptionRulesSealedAdminUpdateShippingOptionRule.fromJson(
    Map<String, dynamic> json,
  ) =>
      _$AdminUpdateShippingOptionRulesSealedAdminUpdateShippingOptionRuleFromJson(
        json,
      );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminUpdateShippingOptionRulesSealedAdminUpdateShippingOptionRuleToJson(
        this,
      );
}
