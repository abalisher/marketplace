// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'rules.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Rules _$RulesFromJson(Map<String, dynamic> json) => Rules(
  attribute: json['attribute'] as String,
  operatorEnum: OperatorEnum.fromJson(json['operator'] as String),
  value: json['value'] as num,
);

Map<String, dynamic> _$RulesToJson(Rules instance) => <String, dynamic>{
  'attribute': instance.attribute,
  'operator': _$OperatorEnumEnumMap[instance.operatorEnum]!,
  'value': instance.value,
};

const _$OperatorEnumEnumMap = {
  OperatorEnum.gt: 'gt',
  OperatorEnum.lt: 'lt',
  OperatorEnum.eq: 'eq',
  OperatorEnum.lte: 'lte',
  OperatorEnum.gte: 'gte',
  OperatorEnum.$unknown: r'$unknown',
};
