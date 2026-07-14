// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'get_store_orders_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GetStoreOrdersResponse _$GetStoreOrdersResponseFromJson(
  Map<String, dynamic> json,
) => GetStoreOrdersResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  orders: (json['orders'] as List<dynamic>)
      .map((e) => StoreOrder.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$GetStoreOrdersResponseToJson(
  GetStoreOrdersResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'orders': instance.orders,
};
