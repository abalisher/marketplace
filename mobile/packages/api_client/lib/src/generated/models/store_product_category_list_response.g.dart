// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_product_category_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreProductCategoryListResponse _$StoreProductCategoryListResponseFromJson(
  Map<String, dynamic> json,
) => StoreProductCategoryListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  productCategories: (json['product_categories'] as List<dynamic>)
      .map((e) => StoreProductCategory.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$StoreProductCategoryListResponseToJson(
  StoreProductCategoryListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'product_categories': instance.productCategories,
  'estimate_count': ?instance.estimateCount,
};
