// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'get_store_product_options_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GetStoreProductOptionsResponse _$GetStoreProductOptionsResponseFromJson(
  Map<String, dynamic> json,
) => GetStoreProductOptionsResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  productOptions: (json['product_options'] as List<dynamic>)
      .map((e) => StoreProductOption.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$GetStoreProductOptionsResponseToJson(
  GetStoreProductOptionsResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'estimate_count': ?instance.estimateCount,
  'product_options': instance.productOptions,
};
