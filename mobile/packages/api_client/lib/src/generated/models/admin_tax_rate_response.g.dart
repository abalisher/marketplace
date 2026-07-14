// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_tax_rate_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTaxRateResponse _$AdminTaxRateResponseFromJson(
  Map<String, dynamic> json,
) => AdminTaxRateResponse(
  taxRate: AdminTaxRate.fromJson(json['tax_rate'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminTaxRateResponseToJson(
  AdminTaxRateResponse instance,
) => <String, dynamic>{'tax_rate': instance.taxRate};
