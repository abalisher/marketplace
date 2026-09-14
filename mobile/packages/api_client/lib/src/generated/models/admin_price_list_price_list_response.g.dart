// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_list_price_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceListPriceListResponse _$AdminPriceListPriceListResponseFromJson(
  Map<String, dynamic> json,
) => AdminPriceListPriceListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  prices: (json['prices'] as List<dynamic>)
      .map((e) => AdminPrice.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminPriceListPriceListResponseToJson(
  AdminPriceListPriceListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'estimate_count': ?instance.estimateCount,
  'prices': instance.prices,
};
