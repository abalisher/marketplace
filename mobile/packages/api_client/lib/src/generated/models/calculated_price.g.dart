// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'calculated_price.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CalculatedPrice _$CalculatedPriceFromJson(Map<String, dynamic> json) =>
    CalculatedPrice(
      id: json['id'] as String,
      priceListId: json['price_list_id'] as String,
      priceListType: json['price_list_type'] as String,
      minQuantity: json['min_quantity'] as num,
      maxQuantity: json['max_quantity'] as num,
    );

Map<String, dynamic> _$CalculatedPriceToJson(CalculatedPrice instance) =>
    <String, dynamic>{
      'id': instance.id,
      'price_list_id': instance.priceListId,
      'price_list_type': instance.priceListType,
      'min_quantity': instance.minQuantity,
      'max_quantity': instance.maxQuantity,
    };
