// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_card_totals.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderCardTotals _$AdminOrderCardTotalsFromJson(
  Map<String, dynamic> json,
) => AdminOrderCardTotals(
  itemTotal: json['item_total'] as num?,
  shippingTotal: json['shipping_total'] as num?,
  discountTotal: json['discount_total'] as num?,
  total: json['total'] as num?,
  currencyCode: json['currency_code'] as String?,
);

Map<String, dynamic> _$AdminOrderCardTotalsToJson(
  AdminOrderCardTotals instance,
) => <String, dynamic>{
  'item_total': ?instance.itemTotal,
  'shipping_total': ?instance.shippingTotal,
  'discount_total': ?instance.discountTotal,
  'total': ?instance.total,
  'currency_code': ?instance.currencyCode,
};
