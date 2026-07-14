// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_product_variant_price.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateProductVariantPrice _$AdminCreateProductVariantPriceFromJson(
  Map<String, dynamic> json,
) => AdminCreateProductVariantPrice(
  currencyCode: json['currency_code'] as String,
  amount: json['amount'] as num,
  minQuantity: json['min_quantity'] as num?,
  maxQuantity: json['max_quantity'] as num?,
  rules: json['rules'],
);

Map<String, dynamic> _$AdminCreateProductVariantPriceToJson(
  AdminCreateProductVariantPrice instance,
) => <String, dynamic>{
  'currency_code': instance.currencyCode,
  'amount': instance.amount,
  'min_quantity': instance.minQuantity,
  'max_quantity': instance.maxQuantity,
  'rules': instance.rules,
};
