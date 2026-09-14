// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_option_rule.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingOptionRule _$AdminShippingOptionRuleFromJson(
  Map<String, dynamic> json,
) => AdminShippingOptionRule(
  id: json['id'] as String,
  attribute: json['attribute'] as String,
  operatorEnum: AdminShippingOptionRuleOperatorEnum.fromJson(
    json['operator'] as String,
  ),
  value: json['value'],
  shippingOptionId: json['shipping_option_id'] as String,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
);

Map<String, dynamic> _$AdminShippingOptionRuleToJson(
  AdminShippingOptionRule instance,
) => <String, dynamic>{
  'id': instance.id,
  'attribute': instance.attribute,
  'operator':
      _$AdminShippingOptionRuleOperatorEnumEnumMap[instance.operatorEnum]!,
  'value': ?instance.value,
  'shipping_option_id': instance.shippingOptionId,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'deleted_at': ?instance.deletedAt?.toIso8601String(),
};

const _$AdminShippingOptionRuleOperatorEnumEnumMap = {
  AdminShippingOptionRuleOperatorEnum.gt: 'gt',
  AdminShippingOptionRuleOperatorEnum.lt: 'lt',
  AdminShippingOptionRuleOperatorEnum.eq: 'eq',
  AdminShippingOptionRuleOperatorEnum.ne: 'ne',
  AdminShippingOptionRuleOperatorEnum.valueIn: 'in',
  AdminShippingOptionRuleOperatorEnum.lte: 'lte',
  AdminShippingOptionRuleOperatorEnum.gte: 'gte',
  AdminShippingOptionRuleOperatorEnum.nin: 'nin',
  AdminShippingOptionRuleOperatorEnum.$unknown: r'$unknown',
};
