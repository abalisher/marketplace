// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_cart_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantCartSummary _$StoreAssistantCartSummaryFromJson(
  Map<String, dynamic> json,
) => StoreAssistantCartSummary(
  cartId: json['cart_id'] as String,
  currency: json['currency'] as String,
  items: (json['items'] as List<dynamic>)
      .map((e) => StoreAssistantCartLine.fromJson(e as Map<String, dynamic>))
      .toList(),
  itemCount: json['item_count'] as num,
  total: json['total'] as num,
);

Map<String, dynamic> _$StoreAssistantCartSummaryToJson(
  StoreAssistantCartSummary instance,
) => <String, dynamic>{
  'cart_id': instance.cartId,
  'currency': instance.currency,
  'items': instance.items,
  'item_count': instance.itemCount,
  'total': instance.total,
};
