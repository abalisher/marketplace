// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_product_tag_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminProductTagListResponse _$AdminProductTagListResponseFromJson(
  Map<String, dynamic> json,
) => AdminProductTagListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  productTags: (json['product_tags'] as List<dynamic>)
      .map((e) => AdminProductTag.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminProductTagListResponseToJson(
  AdminProductTagListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'product_tags': instance.productTags,
  'estimate_count': instance.estimateCount,
};
