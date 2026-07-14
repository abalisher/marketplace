// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'get_store_payment_providers_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

GetStorePaymentProvidersResponse _$GetStorePaymentProvidersResponseFromJson(
  Map<String, dynamic> json,
) => GetStorePaymentProvidersResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  paymentProviders: (json['payment_providers'] as List<dynamic>)
      .map((e) => StorePaymentProvider.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$GetStorePaymentProvidersResponseToJson(
  GetStorePaymentProvidersResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'payment_providers': instance.paymentProviders,
};
