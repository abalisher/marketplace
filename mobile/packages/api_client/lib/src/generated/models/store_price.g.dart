// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_price.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StorePrice _$StorePriceFromJson(Map<String, dynamic> json) => StorePrice(
  id: json['id'] as String,
  currencyCode: json['currency_code'] as String,
  amount: json['amount'] as num,
  minQuantity: json['min_quantity'] as num,
  maxQuantity: json['max_quantity'] as num,
  priceRules: (json['price_rules'] as List<dynamic>?)
      ?.map((e) => StorePriceRule.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StorePriceToJson(StorePrice instance) =>
    <String, dynamic>{
      'id': instance.id,
      'currency_code': instance.currencyCode,
      'amount': instance.amount,
      'min_quantity': instance.minQuantity,
      'max_quantity': instance.maxQuantity,
      'price_rules': ?instance.priceRules,
    };
