// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_stock_location_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminStockLocationListResponse _$AdminStockLocationListResponseFromJson(
  Map<String, dynamic> json,
) => AdminStockLocationListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  stockLocations: (json['stock_locations'] as List<dynamic>)
      .map((e) => AdminStockLocation.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminStockLocationListResponseToJson(
  AdminStockLocationListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'stock_locations': instance.stockLocations,
  'estimate_count': instance.estimateCount,
};
