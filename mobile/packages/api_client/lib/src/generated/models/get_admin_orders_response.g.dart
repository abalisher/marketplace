// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'get_admin_orders_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GetAdminOrdersResponse _$GetAdminOrdersResponseFromJson(
  Map<String, dynamic> json,
) => GetAdminOrdersResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  orders: (json['orders'] as List<dynamic>)
      .map((e) => AdminOrder.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$GetAdminOrdersResponseToJson(
  GetAdminOrdersResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'orders': instance.orders,
};
