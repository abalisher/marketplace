// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'get_admin_products_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GetAdminProductsResponse _$GetAdminProductsResponseFromJson(
  Map<String, dynamic> json,
) => GetAdminProductsResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  products: json['products'] as List<dynamic>,
);

Map<String, dynamic> _$GetAdminProductsResponseToJson(
  GetAdminProductsResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'products': instance.products,
};
