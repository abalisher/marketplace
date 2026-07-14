// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_preference_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPricePreferenceListResponse _$AdminPricePreferenceListResponseFromJson(
  Map<String, dynamic> json,
) => AdminPricePreferenceListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  pricePreferences: (json['price_preferences'] as List<dynamic>)
      .map((e) => AdminPricePreference.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$AdminPricePreferenceListResponseToJson(
  AdminPricePreferenceListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'price_preferences': instance.pricePreferences,
  'estimate_count': instance.estimateCount,
};
