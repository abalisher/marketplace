// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_counter_cart_credit_line.dart';
import 'admin_counter_cart_item.dart';
import 'admin_counter_cart_payment_session.dart';
import 'admin_counter_cart_shipping_method.dart';

part 'admin_counter_cart.g.dart';

@JsonSerializable()
class AdminCounterCart {
  const AdminCounterCart({
    required this.id,
    required this.currencyCode,
    required this.items,
    required this.subtotal,
    required this.itemTotal,
    required this.shippingTotal,
    required this.total,
    required this.creditLines,
    required this.shippingMethods,
    required this.paymentSessions,
    this.email,
    this.regionId,
    this.salesChannelId,
    this.metadata,
    this.completedAt,
    this.createdAt,
    this.paymentCollectionId,
  });

  factory AdminCounterCart.fromJson(Map<String, Object?> json) =>
      _$AdminCounterCartFromJson(json);

  final String id;
  final String? email;
  @JsonKey(name: 'currency_code')
  final String currencyCode;
  @JsonKey(name: 'region_id')
  final String? regionId;
  @JsonKey(name: 'sales_channel_id')
  final String? salesChannelId;

  /// counter: true + location_id склада продавца.
  final dynamic metadata;
  @JsonKey(name: 'completed_at')
  final DateTime? completedAt;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  final List<AdminCounterCartItem> items;
  final num subtotal;
  @JsonKey(name: 'item_total')
  final num itemTotal;
  @JsonKey(name: 'shipping_total')
  final num shippingTotal;
  final num total;
  @JsonKey(name: 'credit_lines')
  final List<AdminCounterCartCreditLine> creditLines;
  @JsonKey(name: 'shipping_methods')
  final List<AdminCounterCartShippingMethod> shippingMethods;
  @JsonKey(name: 'payment_collection_id')
  final String? paymentCollectionId;
  @JsonKey(name: 'payment_sessions')
  final List<AdminCounterCartPaymentSession> paymentSessions;

  Map<String, Object?> toJson() => _$AdminCounterCartToJson(this);
}
