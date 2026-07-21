// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_counter_cart.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCounterCart _$AdminCounterCartFromJson(
  Map<String, dynamic> json,
) => AdminCounterCart(
  id: json['id'] as String,
  currencyCode: json['currency_code'] as String,
  items: (json['items'] as List<dynamic>)
      .map((e) => AdminCounterCartItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  subtotal: json['subtotal'] as num,
  itemTotal: json['item_total'] as num,
  shippingTotal: json['shipping_total'] as num,
  total: json['total'] as num,
  creditLines: (json['credit_lines'] as List<dynamic>)
      .map(
        (e) => AdminCounterCartCreditLine.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  shippingMethods: (json['shipping_methods'] as List<dynamic>)
      .map(
        (e) =>
            AdminCounterCartShippingMethod.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  paymentSessions: (json['payment_sessions'] as List<dynamic>)
      .map(
        (e) =>
            AdminCounterCartPaymentSession.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  email: json['email'] as String?,
  regionId: json['region_id'] as String?,
  salesChannelId: json['sales_channel_id'] as String?,
  metadata: json['metadata'],
  completedAt: json['completed_at'] == null
      ? null
      : DateTime.parse(json['completed_at'] as String),
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  paymentCollectionId: json['payment_collection_id'] as String?,
);

Map<String, dynamic> _$AdminCounterCartToJson(AdminCounterCart instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'currency_code': instance.currencyCode,
      'region_id': instance.regionId,
      'sales_channel_id': instance.salesChannelId,
      'metadata': instance.metadata,
      'completed_at': instance.completedAt?.toIso8601String(),
      'created_at': instance.createdAt?.toIso8601String(),
      'items': instance.items,
      'subtotal': instance.subtotal,
      'item_total': instance.itemTotal,
      'shipping_total': instance.shippingTotal,
      'total': instance.total,
      'credit_lines': instance.creditLines,
      'shipping_methods': instance.shippingMethods,
      'payment_collection_id': instance.paymentCollectionId,
      'payment_sessions': instance.paymentSessions,
    };
