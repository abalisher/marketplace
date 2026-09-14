// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_promotion_rule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdatePromotionRule _$AdminUpdatePromotionRuleFromJson(
  Map<String, dynamic> json,
) => AdminUpdatePromotionRule(
  id: json['id'] as String,
  values: json['values'],
  operatorEnum: json['operator'] == null
      ? null
      : AdminUpdatePromotionRuleOperatorEnum.fromJson(
          json['operator'] as String,
        ),
  description: json['description'] as String?,
  attribute: json['attribute'] as String?,
);

Map<String, dynamic> _$AdminUpdatePromotionRuleToJson(
  AdminUpdatePromotionRule instance,
) => <String, dynamic>{
  'id': instance.id,
  'operator':
      ?_$AdminUpdatePromotionRuleOperatorEnumEnumMap[instance.operatorEnum],
  'description': ?instance.description,
  'attribute': ?instance.attribute,
  'values': ?instance.values,
};

const _$AdminUpdatePromotionRuleOperatorEnumEnumMap = {
  AdminUpdatePromotionRuleOperatorEnum.gte: 'gte',
  AdminUpdatePromotionRuleOperatorEnum.lte: 'lte',
  AdminUpdatePromotionRuleOperatorEnum.gt: 'gt',
  AdminUpdatePromotionRuleOperatorEnum.lt: 'lt',
  AdminUpdatePromotionRuleOperatorEnum.eq: 'eq',
  AdminUpdatePromotionRuleOperatorEnum.ne: 'ne',
  AdminUpdatePromotionRuleOperatorEnum.valueIn: 'in',
  AdminUpdatePromotionRuleOperatorEnum.$unknown: r'$unknown',
};
