// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProductListResponse _$StoreProductListResponseFromJson(
  Map<String, dynamic> json,
) => StoreProductListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  products: (json['products'] as List<dynamic>)
      .map((e) => StoreProduct.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$StoreProductListResponseToJson(
  StoreProductListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'estimate_count': ?instance.estimateCount,
  'products': instance.products,
};
