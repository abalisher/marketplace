// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_application_method.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminApplicationMethod _$AdminApplicationMethodFromJson(
  Map<String, dynamic> json,
) => AdminApplicationMethod(
  id: json['id'] as String,
  promotion: json['promotion'],
  targetRules: (json['target_rules'] as List<dynamic>?)
      ?.map((e) => AdminPromotionRule.fromJson(e as Map<String, dynamic>))
      .toList(),
  buyRules: (json['buy_rules'] as List<dynamic>?)
      ?.map((e) => AdminPromotionRule.fromJson(e as Map<String, dynamic>))
      .toList(),
  type: json['type'] == null
      ? null
      : AdminApplicationMethodType.fromJson(json['type'] as String),
  targetType: json['target_type'] == null
      ? null
      : AdminApplicationMethodTargetType.fromJson(
          json['target_type'] as String,
        ),
  allocation: json['allocation'] == null
      ? null
      : AdminApplicationMethodAllocation.fromJson(json['allocation'] as String),
  value: json['value'] as num?,
  currencyCode: json['currency_code'] as String?,
  maxQuantity: json['max_quantity'] as num?,
  buyRulesMinQuantity: json['buy_rules_min_quantity'] as num?,
  applyToQuantity: json['apply_to_quantity'] as num?,
);

Map<String, dynamic> _$AdminApplicationMethodToJson(
  AdminApplicationMethod instance,
) => <String, dynamic>{
  'promotion': instance.promotion,
  'target_rules': instance.targetRules,
  'buy_rules': instance.buyRules,
  'id': instance.id,
  'type': _$AdminApplicationMethodTypeEnumMap[instance.type],
  'target_type': _$AdminApplicationMethodTargetTypeEnumMap[instance.targetType],
  'allocation': _$AdminApplicationMethodAllocationEnumMap[instance.allocation],
  'value': instance.value,
  'currency_code': instance.currencyCode,
  'max_quantity': instance.maxQuantity,
  'buy_rules_min_quantity': instance.buyRulesMinQuantity,
  'apply_to_quantity': instance.applyToQuantity,
};

const _$AdminApplicationMethodTypeEnumMap = {
  AdminApplicationMethodType.fixed: 'fixed',
  AdminApplicationMethodType.percentage: 'percentage',
  AdminApplicationMethodType.$unknown: r'$unknown',
};

const _$AdminApplicationMethodTargetTypeEnumMap = {
  AdminApplicationMethodTargetType.items: 'items',
  AdminApplicationMethodTargetType.shippingMethods: 'shipping_methods',
  AdminApplicationMethodTargetType.order: 'order',
  AdminApplicationMethodTargetType.$unknown: r'$unknown',
};

const _$AdminApplicationMethodAllocationEnumMap = {
  AdminApplicationMethodAllocation.each: 'each',
  AdminApplicationMethodAllocation.across: 'across',
  AdminApplicationMethodAllocation.$unknown: r'$unknown',
};
