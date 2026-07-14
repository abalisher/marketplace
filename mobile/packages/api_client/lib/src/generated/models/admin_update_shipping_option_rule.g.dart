// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_shipping_option_rule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateShippingOptionRule _$AdminUpdateShippingOptionRuleFromJson(
  Map<String, dynamic> json,
) => AdminUpdateShippingOptionRule(
  id: json['id'] as String,
  operatorEnum: AdminUpdateShippingOptionRuleOperatorEnum.fromJson(
    json['operator'] as String,
  ),
  attribute: json['attribute'] as String,
  value: json['value'],
);

Map<String, dynamic> _$AdminUpdateShippingOptionRuleToJson(
  AdminUpdateShippingOptionRule instance,
) => <String, dynamic>{
  'id': instance.id,
  'operator':
      _$AdminUpdateShippingOptionRuleOperatorEnumEnumMap[instance
          .operatorEnum]!,
  'attribute': instance.attribute,
  'value': instance.value,
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
