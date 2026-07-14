// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_promotion_rule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreatePromotionRule _$AdminCreatePromotionRuleFromJson(
  Map<String, dynamic> json,
) => AdminCreatePromotionRule(
  operatorEnum: AdminCreatePromotionRuleOperatorEnum.fromJson(
    json['operator'] as String,
  ),
  attribute: json['attribute'] as String,
  values: json['values'],
  description: json['description'] as String?,
);

Map<String, dynamic> _$AdminCreatePromotionRuleToJson(
  AdminCreatePromotionRule instance,
) => <String, dynamic>{
  'operator':
      _$AdminCreatePromotionRuleOperatorEnumEnumMap[instance.operatorEnum]!,
  'description': instance.description,
  'attribute': instance.attribute,
  'values': instance.values,
};

const _$AdminCreatePromotionRuleOperatorEnumEnumMap = {
  AdminCreatePromotionRuleOperatorEnum.gte: 'gte',
  AdminCreatePromotionRuleOperatorEnum.lte: 'lte',
  AdminCreatePromotionRuleOperatorEnum.gt: 'gt',
  AdminCreatePromotionRuleOperatorEnum.lt: 'lt',
  AdminCreatePromotionRuleOperatorEnum.eq: 'eq',
  AdminCreatePromotionRuleOperatorEnum.ne: 'ne',
  AdminCreatePromotionRuleOperatorEnum.valueIn: 'in',
  AdminCreatePromotionRuleOperatorEnum.$unknown: r'$unknown',
};
