// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_shipping_option_rules_sealed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Map<String, dynamic> _$AdminUpdateShippingOptionRulesSealedToJson(
  AdminUpdateShippingOptionRulesSealed instance,
) => <String, dynamic>{};

AdminUpdateShippingOptionRulesSealedAdminCreateShippingOptionRule
_$AdminUpdateShippingOptionRulesSealedAdminCreateShippingOptionRuleFromJson(
  Map<String, dynamic> json,
) => AdminUpdateShippingOptionRulesSealedAdminCreateShippingOptionRule(
  operatorEnum: AdminCreateShippingOptionRuleOperatorEnum.fromJson(
    json['operatorEnum'] as String,
  ),
  attribute: json['attribute'] as String,
  value: json['value'],
);

Map<String, dynamic>
_$AdminUpdateShippingOptionRulesSealedAdminCreateShippingOptionRuleToJson(
  AdminUpdateShippingOptionRulesSealedAdminCreateShippingOptionRule instance,
) => <String, dynamic>{
  'operatorEnum':
      _$AdminCreateShippingOptionRuleOperatorEnumEnumMap[instance
          .operatorEnum]!,
  'attribute': instance.attribute,
  'value': ?instance.value,
};

const _$AdminCreateShippingOptionRuleOperatorEnumEnumMap = {
  AdminCreateShippingOptionRuleOperatorEnum.gt: 'gt',
  AdminCreateShippingOptionRuleOperatorEnum.lt: 'lt',
  AdminCreateShippingOptionRuleOperatorEnum.eq: 'eq',
  AdminCreateShippingOptionRuleOperatorEnum.ne: 'ne',
  AdminCreateShippingOptionRuleOperatorEnum.valueIn: 'in',
  AdminCreateShippingOptionRuleOperatorEnum.lte: 'lte',
  AdminCreateShippingOptionRuleOperatorEnum.gte: 'gte',
  AdminCreateShippingOptionRuleOperatorEnum.nin: 'nin',
  AdminCreateShippingOptionRuleOperatorEnum.$unknown: r'$unknown',
};

AdminUpdateShippingOptionRulesSealedAdminUpdateShippingOptionRule
_$AdminUpdateShippingOptionRulesSealedAdminUpdateShippingOptionRuleFromJson(
  Map<String, dynamic> json,
) => AdminUpdateShippingOptionRulesSealedAdminUpdateShippingOptionRule(
  id: json['id'] as String,
  operatorEnum: AdminUpdateShippingOptionRuleOperatorEnum.fromJson(
    json['operatorEnum'] as String,
  ),
  attribute: json['attribute'] as String,
  value: json['value'],
);

Map<String, dynamic>
_$AdminUpdateShippingOptionRulesSealedAdminUpdateShippingOptionRuleToJson(
  AdminUpdateShippingOptionRulesSealedAdminUpdateShippingOptionRule instance,
) => <String, dynamic>{
  'id': instance.id,
  'operatorEnum':
      _$AdminUpdateShippingOptionRuleOperatorEnumEnumMap[instance
          .operatorEnum]!,
  'attribute': instance.attribute,
  'value': ?instance.value,
};

const _$AdminUpdateShippingOptionRuleOperatorEnumEnumMap = {
  AdminUpdateShippingOptionRuleOperatorEnum.gt: 'gt',
  AdminUpdateShippingOptionRuleOperatorEnum.lt: 'lt',
  AdminUpdateShippingOptionRuleOperatorEnum.eq: 'eq',
  AdminUpdateShippingOptionRuleOperatorEnum.ne: 'ne',
  AdminUpdateShippingOptionRuleOperatorEnum.valueIn: 'in',
  AdminUpdateShippingOptionRuleOperatorEnum.lte: 'lte',
  AdminUpdateShippingOptionRuleOperatorEnum.gte: 'gte',
  AdminUpdateShippingOptionRuleOperatorEnum.nin: 'nin',
  AdminUpdateShippingOptionRuleOperatorEnum.$unknown: r'$unknown',
};
