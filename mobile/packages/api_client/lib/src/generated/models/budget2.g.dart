// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'budget2.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Budget2 _$Budget2FromJson(Map<String, dynamic> json) => Budget2(
  id: json['id'] as String,
  type: Type.fromJson(json['type'] as String),
  currencyCode: json['currency_code'] as String,
  limit: json['limit'] as num,
  used: json['used'] as num,
);

Map<String, dynamic> _$Budget2ToJson(Budget2 instance) => <String, dynamic>{
  'id': instance.id,
  'type': _$TypeEnumMap[instance.type]!,
  'currency_code': instance.currencyCode,
  'limit': instance.limit,
  'used': instance.used,
};

const _$TypeEnumMap = {
  Type.spend: 'spend',
  Type.usage: 'usage',
  Type.$unknown: r'$unknown',
};
