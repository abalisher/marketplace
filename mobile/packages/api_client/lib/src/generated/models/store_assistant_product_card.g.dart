// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_product_card.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantProductCard _$StoreAssistantProductCardFromJson(
  Map<String, dynamic> json,
) => StoreAssistantProductCard(
  type: StoreAssistantProductCardType.fromJson(json['type'] as String),
  variantId: json['variant_id'] as String,
  title: json['title'] as String,
  price: json['price'] as num,
  currency: json['currency'] as String,
  unit: json['unit'] as String?,
  inStock: json['in_stock'] as bool,
  imageUrl: json['image_url'] as String?,
);

Map<String, dynamic> _$StoreAssistantProductCardToJson(
  StoreAssistantProductCard instance,
) => <String, dynamic>{
  'type': _$StoreAssistantProductCardTypeEnumMap[instance.type]!,
  'variant_id': instance.variantId,
  'title': instance.title,
  'price': instance.price,
  'currency': instance.currency,
  'unit': ?instance.unit,
  'in_stock': instance.inStock,
  'image_url': ?instance.imageUrl,
};

const _$StoreAssistantProductCardTypeEnumMap = {
  StoreAssistantProductCardType.productCard: 'product_card',
  StoreAssistantProductCardType.$unknown: r'$unknown',
};
