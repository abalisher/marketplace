// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateOrder _$AdminUpdateOrderFromJson(
  Map<String, dynamic> json,
) => AdminUpdateOrder(
  email: json['email'] as String?,
  shippingAddress: json['shipping_address'] == null
      ? null
      : OrderAddress.fromJson(json['shipping_address'] as Map<String, dynamic>),
  billingAddress: json['billing_address'] == null
      ? null
      : OrderAddress.fromJson(json['billing_address'] as Map<String, dynamic>),
  metadata: json['metadata'],
  locale: json['locale'] as String?,
);

Map<String, dynamic> _$AdminUpdateOrderToJson(AdminUpdateOrder instance) =>
    <String, dynamic>{
      'email': ?instance.email,
      'shipping_address': ?instance.shippingAddress,
      'billing_address': ?instance.billingAddress,
      'metadata': ?instance.metadata,
      'locale': ?instance.locale,
    };
