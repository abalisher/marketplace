// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_price_list_price.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreatePriceListPrice _$AdminCreatePriceListPriceFromJson(
  Map<String, dynamic> json,
) => AdminCreatePriceListPrice(
  currencyCode: json['currency_code'] as String,
  amount: json['amount'] as num,
  variantId: json['variant_id'] as String,
  minQuantity: json['min_quantity'] as num?,
  maxQuantity: json['max_quantity'] as num?,
  rules: json['rules'],
);

Map<String, dynamic> _$AdminCreatePriceListPriceToJson(
  AdminCreatePriceListPrice instance,
) => <String, dynamic>{
  'currency_code': instance.currencyCode,
  'amount': instance.amount,
  'variant_id': instance.variantId,
  'min_quantity': instance.minQuantity,
  'max_quantity': instance.maxQuantity,
  'rules': instance.rules,
};
