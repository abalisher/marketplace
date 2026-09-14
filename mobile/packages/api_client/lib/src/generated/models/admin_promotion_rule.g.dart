// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_promotion_rule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPromotionRule _$AdminPromotionRuleFromJson(Map<String, dynamic> json) =>
    AdminPromotionRule(
      id: json['id'] as String,
      values: (json['values'] as List<dynamic>)
          .map(
            (e) => BasePromotionRuleValue.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
      description: json['description'] as String?,
      attribute: json['attribute'] as String?,
      operatorEnum: json['operator'] == null
          ? null
          : AdminPromotionRuleOperatorEnum.fromJson(json['operator'] as String),
    );

Map<String, dynamic> _$AdminPromotionRuleToJson(
  AdminPromotionRule instance,
) => <String, dynamic>{
  'id': instance.id,
  'description': ?instance.description,
  'attribute': ?instance.attribute,
  'operator': ?_$AdminPromotionRuleOperatorEnumEnumMap[instance.operatorEnum],
  'values': instance.values,
};

const _$AdminPromotionRuleOperatorEnumEnumMap = {
  AdminPromotionRuleOperatorEnum.gt: 'gt',
  AdminPromotionRuleOperatorEnum.lt: 'lt',
  AdminPromotionRuleOperatorEnum.eq: 'eq',
  AdminPromotionRuleOperatorEnum.ne: 'ne',
  AdminPromotionRuleOperatorEnum.valueIn: 'in',
  AdminPromotionRuleOperatorEnum.lte: 'lte',
  AdminPromotionRuleOperatorEnum.gte: 'gte',
  AdminPromotionRuleOperatorEnum.$unknown: r'$unknown',
};
