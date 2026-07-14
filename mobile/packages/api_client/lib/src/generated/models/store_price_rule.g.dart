// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_price_rule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StorePriceRule _$StorePriceRuleFromJson(Map<String, dynamic> json) =>
    StorePriceRule(
      id: json['id'] as String,
      attribute: json['attribute'] as String,
      operatorEnum: StorePriceRuleOperatorEnum.fromJson(
        json['operator'] as String,
      ),
      value: json['value'] as String,
    );

Map<String, dynamic> _$StorePriceRuleToJson(StorePriceRule instance) =>
    <String, dynamic>{
      'id': instance.id,
      'attribute': instance.attribute,
      'operator': _$StorePriceRuleOperatorEnumEnumMap[instance.operatorEnum]!,
      'value': instance.value,
    };

const _$StorePriceRuleOperatorEnumEnumMap = {
  StorePriceRuleOperatorEnum.gt: 'gt',
  StorePriceRuleOperatorEnum.lt: 'lt',
  StorePriceRuleOperatorEnum.eq: 'eq',
  StorePriceRuleOperatorEnum.lte: 'lte',
  StorePriceRuleOperatorEnum.gte: 'gte',
  StorePriceRuleOperatorEnum.$unknown: r'$unknown',
};
