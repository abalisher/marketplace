// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_list_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceListListResponse _$AdminPriceListListResponseFromJson(
  Map<String, dynamic> json,
) => AdminPriceListListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  priceLists: (json['price_lists'] as List<dynamic>)
      .map((e) => AdminPriceList.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminPriceListListResponseToJson(
  AdminPriceListListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'price_lists': instance.priceLists,
  'estimate_count': instance.estimateCount,
};
