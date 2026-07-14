// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_currency_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCurrencyListResponse _$StoreCurrencyListResponseFromJson(
  Map<String, dynamic> json,
) => StoreCurrencyListResponse(
  limit: json['limit'] as num,
  offset: json['offset'] as num,
  count: json['count'] as num,
  currencies: (json['currencies'] as List<dynamic>)
      .map((e) => StoreCurrency.fromJson(e as Map<String, dynamic>))
      .toList(),
  estimateCount: json['estimate_count'] as num?,
);

Map<String, dynamic> _$StoreCurrencyListResponseToJson(
  StoreCurrencyListResponse instance,
) => <String, dynamic>{
  'limit': instance.limit,
  'offset': instance.offset,
  'count': instance.count,
  'currencies': instance.currencies,
  'estimate_count': instance.estimateCount,
};
