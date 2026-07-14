// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_fulfillment_provider_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminFulfillmentProviderListResponse
_$AdminFulfillmentProviderListResponseFromJson(Map<String, dynamic> json) =>
    AdminFulfillmentProviderListResponse(
      limit: json['limit'] as num,
      offset: json['offset'] as num,
      count: json['count'] as num,
      fulfillmentProviders: (json['fulfillment_providers'] as List<dynamic>)
          .map(
            (e) => AdminFulfillmentProvider.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
      estimateCount: json['estimate_count'] as num?,
    );

Map<String, dynamic> _$AdminFulfillmentProviderListResponseToJson(
  AdminFulfillmentProviderListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'fulfillment_providers': instance.fulfillmentProviders,
  'estimate_count': instance.estimateCount,
};
