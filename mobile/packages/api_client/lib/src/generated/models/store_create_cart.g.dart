// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_create_cart.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCreateCart _$StoreCreateCartFromJson(Map<String, dynamic> json) =>
    StoreCreateCart(
      regionId: json['region_id'] as String?,
      shippingAddress: json['shipping_address'] == null
          ? null
          : StoreCartAddress.fromJson(
              json['shipping_address'] as Map<String, dynamic>,
            ),
      billingAddress: json['billing_address'] == null
          ? null
          : StoreCartAddress.fromJson(
              json['billing_address'] as Map<String, dynamic>,
            ),
      email: json['email'] as String?,
      currencyCode: json['currency_code'] as String?,
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => StoreCartLineItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      salesChannelId: json['sales_channel_id'] as String?,
      metadata: json['metadata'],
    );

Map<String, dynamic> _$StoreCreateCartToJson(StoreCreateCart instance) =>
    <String, dynamic>{
      'region_id': ?instance.regionId,
      'shipping_address': ?instance.shippingAddress,
      'billing_address': ?instance.billingAddress,
      'email': ?instance.email,
      'currency_code': ?instance.currencyCode,
      'items': ?instance.items,
      'sales_channel_id': ?instance.salesChannelId,
      'metadata': ?instance.metadata,
    };
