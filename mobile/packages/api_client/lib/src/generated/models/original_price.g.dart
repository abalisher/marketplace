// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'original_price.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OriginalPrice _$OriginalPriceFromJson(Map<String, dynamic> json) =>
    OriginalPrice(
      id: json['id'] as String,
      priceListId: json['price_list_id'] as String,
      priceListType: json['price_list_type'] as String,
      minQuantity: json['min_quantity'] as num,
      maxQuantity: json['max_quantity'] as num,
    );

Map<String, dynamic> _$OriginalPriceToJson(OriginalPrice instance) =>
    <String, dynamic>{
      'id': instance.id,
      'price_list_id': instance.priceListId,
      'price_list_type': instance.priceListType,
      'min_quantity': instance.minQuantity,
      'max_quantity': instance.maxQuantity,
    };
