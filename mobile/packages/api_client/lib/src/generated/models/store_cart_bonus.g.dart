// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_cart_bonus.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCartBonus _$StoreCartBonusFromJson(Map<String, dynamic> json) =>
    StoreCartBonus(
      amount: (json['amount'] as num).toInt(),
      cartTotal: json['cart_total'] as num,
      currencyCode: json['currency_code'] as String,
    );

Map<String, dynamic> _$StoreCartBonusToJson(StoreCartBonus instance) =>
    <String, dynamic>{
      'amount': instance.amount,
      'cart_total': instance.cartTotal,
      'currency_code': instance.currencyCode,
    };
