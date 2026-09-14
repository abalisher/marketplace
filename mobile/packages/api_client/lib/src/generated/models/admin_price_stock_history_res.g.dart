// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_stock_history_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceStockHistoryRes _$AdminPriceStockHistoryResFromJson(
  Map<String, dynamic> json,
) => AdminPriceStockHistoryRes(
  priceChanges: (json['price_changes'] as List<dynamic>)
      .map((e) => AdminPriceChange.fromJson(e as Map<String, dynamic>))
      .toList(),
  count: json['count'] as num,
  offset: json['offset'] as num,
  limit: json['limit'] as num,
);

Map<String, dynamic> _$AdminPriceStockHistoryResToJson(
  AdminPriceStockHistoryRes instance,
) => <String, dynamic>{
  'price_changes': instance.priceChanges,
  'count': instance.count,
  'offset': instance.offset,
  'limit': instance.limit,
};
