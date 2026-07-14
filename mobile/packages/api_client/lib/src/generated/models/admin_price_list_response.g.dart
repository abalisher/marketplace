// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceListResponse _$AdminPriceListResponseFromJson(
  Map<String, dynamic> json,
) => AdminPriceListResponse(
  priceList: AdminPriceList.fromJson(
    json['price_list'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminPriceListResponseToJson(
  AdminPriceListResponse instance,
) => <String, dynamic>{'price_list': instance.priceList};
