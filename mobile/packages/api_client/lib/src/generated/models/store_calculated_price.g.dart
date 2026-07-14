// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_calculated_price.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCalculatedPrice _$StoreCalculatedPriceFromJson(
  Map<String, dynamic> json,
) => StoreCalculatedPrice(
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
  calculatedPrice: json['calculated_price'] == null
      ? null
      : CalculatedPrice.fromJson(
          json['calculated_price'] as Map<String, dynamic>,
        ),
  originalPrice: json['original_price'] == null
      ? null
      : OriginalPrice.fromJson(json['original_price'] as Map<String, dynamic>),
);

Map<String, dynamic> _$StoreCalculatedPriceToJson(
  StoreCalculatedPrice instance,
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
