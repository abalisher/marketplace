// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'rules2.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Rules2 _$Rules2FromJson(Map<String, dynamic> json) => Rules2(
  attribute: json['attribute'] as String,
  operatorEnum: OperatorEnum.fromJson(json['operator'] as String),
  value: json['value'] as num,
);

Map<String, dynamic> _$Rules2ToJson(Rules2 instance) => <String, dynamic>{
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
