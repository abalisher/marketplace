// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_store_supported_currency.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateStoreSupportedCurrency _$AdminUpdateStoreSupportedCurrencyFromJson(
  Map<String, dynamic> json,
) => AdminUpdateStoreSupportedCurrency(
  currencyCode: json['currency_code'] as String,
  isDefault: json['is_default'] as bool?,
  isTaxInclusive: json['is_tax_inclusive'] as bool?,
);

Map<String, dynamic> _$AdminUpdateStoreSupportedCurrencyToJson(
  AdminUpdateStoreSupportedCurrency instance,
) => <String, dynamic>{
  'currency_code': instance.currencyCode,
  'is_default': ?instance.isDefault,
  'is_tax_inclusive': ?instance.isTaxInclusive,
};
