// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'get_store_product_variants_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GetStoreProductVariantsResponse _$GetStoreProductVariantsResponseFromJson(
  Map<String, dynamic> json,
) => GetStoreProductVariantsResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  variants: (json['variants'] as List<dynamic>)
      .map((e) => StoreProductVariant.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$GetStoreProductVariantsResponseToJson(
  GetStoreProductVariantsResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'estimate_count': instance.estimateCount,
  'variants': instance.variants,
};
