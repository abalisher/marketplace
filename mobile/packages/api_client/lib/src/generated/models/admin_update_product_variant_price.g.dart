// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_product_variant_price.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateProductVariantPrice _$AdminUpdateProductVariantPriceFromJson(
  Map<String, dynamic> json,
) => AdminUpdateProductVariantPrice(
  currencyCode: json['currency_code'] as String?,
  amount: json['amount'] as num?,
  minQuantity: json['min_quantity'] as num?,
  maxQuantity: json['max_quantity'] as num?,
  rules: json['rules'],
  id: json['id'] as String?,
);

Map<String, dynamic> _$AdminUpdateProductVariantPriceToJson(
  AdminUpdateProductVariantPrice instance,
) => <String, dynamic>{
  'currency_code': instance.currencyCode,
  'amount': instance.amount,
  'min_quantity': instance.minQuantity,
  'max_quantity': instance.maxQuantity,
  'rules': instance.rules,
  'id': instance.id,
};
