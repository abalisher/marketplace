// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_customer_address_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCustomerAddressListResponse _$StoreCustomerAddressListResponseFromJson(
  Map<String, dynamic> json,
) => StoreCustomerAddressListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  addresses: (json['addresses'] as List<dynamic>)
      .map((e) => StoreCustomerAddress.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$StoreCustomerAddressListResponseToJson(
  StoreCustomerAddressListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'addresses': instance.addresses,
  'estimate_count': ?instance.estimateCount,
};
