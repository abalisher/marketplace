// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_shipping_option_price_with_currency.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateShippingOptionPriceWithCurrency
_$AdminUpdateShippingOptionPriceWithCurrencyFromJson(
  Map<String, dynamic> json,
) => AdminUpdateShippingOptionPriceWithCurrency(
  id: json['id'] as String?,
  currencyCode: json['currency_code'] as String?,
  amount: json['amount'] as num?,
  rules: (json['rules'] as List<dynamic>?)
      ?.map((e) => PriceRule.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminUpdateShippingOptionPriceWithCurrencyToJson(
  AdminUpdateShippingOptionPriceWithCurrency instance,
) => <String, dynamic>{
  'id': instance.id,
  'currency_code': instance.currencyCode,
  'amount': instance.amount,
  'rules': instance.rules,
};
