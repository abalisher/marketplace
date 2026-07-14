// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'budget.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Budget _$BudgetFromJson(Map<String, dynamic> json) => Budget(
  id: json['id'] as String,
  type: Type.fromJson(json['type'] as String),
  currencyCode: json['currency_code'] as String,
  limit: json['limit'] as num,
  used: json['used'] as num,
  attribute: json['attribute'] as String,
);

Map<String, dynamic> _$BudgetToJson(Budget instance) => <String, dynamic>{
  'id': instance.id,
  'type': _$TypeEnumMap[instance.type]!,
  'currency_code': instance.currencyCode,
  'limit': instance.limit,
  'used': instance.used,
  'attribute': instance.attribute,
};

const _$TypeEnumMap = {
  Type.spend: 'spend',
  Type.usage: 'usage',
  Type.$unknown: r'$unknown',
};
