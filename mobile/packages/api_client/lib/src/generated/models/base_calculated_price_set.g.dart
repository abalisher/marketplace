// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_calculated_price_set.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BaseCalculatedPriceSet _$BaseCalculatedPriceSetFromJson(
  Map<String, dynamic> json,
) => BaseCalculatedPriceSet(
  id: json['id'] as String,
  calculatedAmount: json['calculated_amount'] as num,
  originalAmount: json['original_amount'] as num,
  currencyCode: json['currency_code'] as String,
  originalAmountWithTax: json['original_amount_with_tax'] as num,
  originalAmountWithoutTax: json['original_amount_without_tax'] as num,
  isCalculatedPricePriceList: json['is_calculated_price_price_list'] as bool?,
  isCalculatedPriceTaxInclusive:
      json['is_calculated_price_tax_inclusive'] as bool?,
  calculatedAmountWithTax: json['calculated_amount_with_tax'] as num?,
  calculatedAmountWithoutTax: json['calculated_amount_without_tax'] as num?,
  isOriginalPricePriceList: json['is_original_price_price_list'] as bool?,
  isOriginalPriceTaxInclusive: json['is_original_price_tax_inclusive'] as bool?,
  calculatedPrice: json['calculated_price'],
  originalPrice: json['original_price'],
);

Map<String, dynamic> _$BaseCalculatedPriceSetToJson(
  BaseCalculatedPriceSet instance,
) => <String, dynamic>{
  'id': instance.id,
  'is_calculated_price_price_list': instance.isCalculatedPricePriceList,
  'is_calculated_price_tax_inclusive': instance.isCalculatedPriceTaxInclusive,
  'calculated_amount': instance.calculatedAmount,
  'calculated_amount_with_tax': instance.calculatedAmountWithTax,
  'calculated_amount_without_tax': instance.calculatedAmountWithoutTax,
  'is_original_price_price_list': instance.isOriginalPricePriceList,
  'is_original_price_tax_inclusive': instance.isOriginalPriceTaxInclusive,
  'original_amount': instance.originalAmount,
  'currency_code': instance.currencyCode,
  'calculated_price': instance.calculatedPrice,
  'original_price': instance.originalPrice,
  'original_amount_with_tax': instance.originalAmountWithTax,
  'original_amount_without_tax': instance.originalAmountWithoutTax,
};
