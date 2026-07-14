// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_shipping_option_rule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateShippingOptionRule _$AdminCreateShippingOptionRuleFromJson(
  Map<String, dynamic> json,
) => AdminCreateShippingOptionRule(
  operatorEnum: AdminCreateShippingOptionRuleOperatorEnum.fromJson(
    json['operator'] as String,
  ),
  attribute: json['attribute'] as String,
  value: json['value'],
);

Map<String, dynamic> _$AdminCreateShippingOptionRuleToJson(
  AdminCreateShippingOptionRule instance,
) => <String, dynamic>{
  'operator':
      _$AdminCreateShippingOptionRuleOperatorEnumEnumMap[instance
          .operatorEnum]!,
  'attribute': instance.attribute,
  'value': instance.value,
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
