// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product_type_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProductTypeListResponse _$StoreProductTypeListResponseFromJson(
  Map<String, dynamic> json,
) => StoreProductTypeListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  productTypes: (json['product_types'] as List<dynamic>)
      .map((e) => StoreProductType.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$StoreProductTypeListResponseToJson(
  StoreProductTypeListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'product_types': instance.productTypes,
  'estimate_count': instance.estimateCount,
};
