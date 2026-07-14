// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_type_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductTypeListResponse _$AdminProductTypeListResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductTypeListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  productTypes: (json['product_types'] as List<dynamic>)
      .map((e) => AdminProductType.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminProductTypeListResponseToJson(
  AdminProductTypeListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'product_types': instance.productTypes,
  'estimate_count': instance.estimateCount,
};
