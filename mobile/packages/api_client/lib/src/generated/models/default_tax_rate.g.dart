// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'default_tax_rate.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DefaultTaxRate _$DefaultTaxRateFromJson(Map<String, dynamic> json) =>
    DefaultTaxRate(
      code: json['code'] as String,
      name: json['name'] as String,
      rate: json['rate'] as num?,
      isCombinable: json['is_combinable'] as bool?,
      metadata: json['metadata'],
    );

Map<String, dynamic> _$DefaultTaxRateToJson(DefaultTaxRate instance) =>
    <String, dynamic>{
      'rate': ?instance.rate,
      'code': instance.code,
      'name': instance.name,
      'is_combinable': ?instance.isCombinable,
      'metadata': ?instance.metadata,
    };
