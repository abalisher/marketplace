// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_list_price.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceListPrice _$AdminPriceListPriceFromJson(Map<String, dynamic> json) =>
    AdminPriceListPrice(
      variantId: json['variant_id'] as String,
      rules: json['rules'],
      id: json['id'] as String,
      title: json['title'] as String,
      currencyCode: json['currency_code'] as String,
      amount: json['amount'] as num,
      rawAmount: json['raw_amount'],
      minQuantity: json['min_quantity'] as num,
      maxQuantity: json['max_quantity'] as num,
      priceSetId: json['price_set_id'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
    );

Map<String, dynamic> _$AdminPriceListPriceToJson(
  AdminPriceListPrice instance,
) => <String, dynamic>{
  'variant_id': instance.variantId,
  'rules': ?instance.rules,
  'id': instance.id,
  'title': instance.title,
  'currency_code': instance.currencyCode,
  'amount': instance.amount,
  'raw_amount': ?instance.rawAmount,
  'min_quantity': instance.minQuantity,
  'max_quantity': instance.maxQuantity,
  'price_set_id': instance.priceSetId,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
  'deleted_at': ?instance.deletedAt?.toIso8601String(),
};
