// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_shipping_option_type_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminShippingOptionTypeListResponse
_$AdminShippingOptionTypeListResponseFromJson(Map<String, dynamic> json) =>
    AdminShippingOptionTypeListResponse(
      limit: json['limit'] as num,
      offset: json['offset'] as num,
      count: json['count'] as num,
      shippingOptionTypes: (json['shipping_option_types'] as List<dynamic>)
          .map(
            (e) => AdminShippingOptionType.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
      estimateCount: json['estimate_count'] as num?,
    );

Map<String, dynamic> _$AdminShippingOptionTypeListResponseToJson(
  AdminShippingOptionTypeListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'estimate_count': instance.estimateCount,
  'shipping_option_types': instance.shippingOptionTypes,
};
