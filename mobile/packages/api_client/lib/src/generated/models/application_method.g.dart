// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'application_method.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ApplicationMethod _$ApplicationMethodFromJson(Map<String, dynamic> json) =>
    ApplicationMethod(
      value: json['value'] as String,
      type: Type2.fromJson(json['type'] as String),
      currencyCode: json['currency_code'] as String,
    );

Map<String, dynamic> _$ApplicationMethodToJson(ApplicationMethod instance) =>
    <String, dynamic>{
      'value': instance.value,
      'type': _$Type2EnumMap[instance.type]!,
      'currency_code': instance.currencyCode,
    };

const _$Type2EnumMap = {
  Type2.fixed: 'fixed',
  Type2.percentage: 'percentage',
  Type2.$unknown: r'$unknown',
};
