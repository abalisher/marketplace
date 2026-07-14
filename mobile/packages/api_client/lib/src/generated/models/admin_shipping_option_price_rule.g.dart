// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_option_price_rule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingOptionPriceRule _$AdminShippingOptionPriceRuleFromJson(
  Map<String, dynamic> json,
) => AdminShippingOptionPriceRule(
  id: json['id'] as String,
  value: json['value'],
  operatorEnum: AdminShippingOptionPriceRuleOperatorEnum.fromJson(
    json['operator'] as String,
  ),
  attribute: json['attribute'] as String,
  priceId: json['price_id'] as String,
  priority: json['priority'] as num,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  deletedAt: DateTime.parse(json['deleted_at'] as String),
);

Map<String, dynamic> _$AdminShippingOptionPriceRuleToJson(
  AdminShippingOptionPriceRule instance,
) => <String, dynamic>{
  'id': instance.id,
  'value': instance.value,
  'operator':
      _$AdminShippingOptionPriceRuleOperatorEnumEnumMap[instance.operatorEnum]!,
  'attribute': instance.attribute,
  'price_id': instance.priceId,
  'priority': instance.priority,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'deleted_at': instance.deletedAt.toIso8601String(),
};

const _$AdminShippingOptionPriceRuleOperatorEnumEnumMap = {
  AdminShippingOptionPriceRuleOperatorEnum.gt: 'gt',
  AdminShippingOptionPriceRuleOperatorEnum.lt: 'lt',
  AdminShippingOptionPriceRuleOperatorEnum.eq: 'eq',
  AdminShippingOptionPriceRuleOperatorEnum.ne: 'ne',
  AdminShippingOptionPriceRuleOperatorEnum.valueIn: 'in',
  AdminShippingOptionPriceRuleOperatorEnum.lte: 'lte',
  AdminShippingOptionPriceRuleOperatorEnum.gte: 'gte',
  AdminShippingOptionPriceRuleOperatorEnum.nin: 'nin',
  AdminShippingOptionPriceRuleOperatorEnum.$unknown: r'$unknown',
};
