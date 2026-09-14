// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product_alternative.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProductAlternative _$StoreProductAlternativeFromJson(
  Map<String, dynamic> json,
) => StoreProductAlternative(
  id: json['id'] as String,
  title: json['title'] as String,
  handle: json['handle'] as String?,
  thumbnail: json['thumbnail'] as String?,
  productCard: json['product_card'] == null
      ? null
      : StoreProductCardSummary.fromJson(
          json['product_card'] as Map<String, dynamic>,
        ),
);

Map<String, dynamic> _$StoreProductAlternativeToJson(
  StoreProductAlternative instance,
) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'handle': ?instance.handle,
  'thumbnail': ?instance.thumbnail,
  'product_card': ?instance.productCard,
};
