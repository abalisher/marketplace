// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'price_rule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PriceRule _$PriceRuleFromJson(Map<String, dynamic> json) => PriceRule(
  attribute: json['attribute'] as String,
  operatorEnum: PriceRuleOperatorEnum.fromJson(json['operator'] as String),
  value: json['value'] as num,
);

Map<String, dynamic> _$PriceRuleToJson(PriceRule instance) => <String, dynamic>{
  'attribute': instance.attribute,
  'operator': _$PriceRuleOperatorEnumEnumMap[instance.operatorEnum]!,
  'value': instance.value,
};

const _$PriceRuleOperatorEnumEnumMap = {
  PriceRuleOperatorEnum.gt: 'gt',
  PriceRuleOperatorEnum.lt: 'lt',
  PriceRuleOperatorEnum.eq: 'eq',
  PriceRuleOperatorEnum.lte: 'lte',
  PriceRuleOperatorEnum.gte: 'gte',
  PriceRuleOperatorEnum.$unknown: r'$unknown',
};
