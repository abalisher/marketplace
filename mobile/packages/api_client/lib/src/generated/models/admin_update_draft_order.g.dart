// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_draft_order.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateDraftOrder _$AdminUpdateDraftOrderFromJson(
  Map<String, dynamic> json,
) => AdminUpdateDraftOrder(
  email: json['email'] as String?,
  shippingAddress: json['shipping_address'] == null
      ? null
      : OrderAddress.fromJson(json['shipping_address'] as Map<String, dynamic>),
  billingAddress: json['billing_address'] == null
      ? null
      : OrderAddress.fromJson(json['billing_address'] as Map<String, dynamic>),
  metadata: json['metadata'],
  customerId: json['customer_id'] as String?,
  salesChannelId: json['sales_channel_id'] as String?,
  locale: json['locale'] as String?,
);

Map<String, dynamic> _$AdminUpdateDraftOrderToJson(
  AdminUpdateDraftOrder instance,
) => <String, dynamic>{
  'email': instance.email,
  'shipping_address': instance.shippingAddress,
  'billing_address': instance.billingAddress,
  'metadata': instance.metadata,
  'customer_id': instance.customerId,
  'sales_channel_id': instance.salesChannelId,
  'locale': instance.locale,
};
