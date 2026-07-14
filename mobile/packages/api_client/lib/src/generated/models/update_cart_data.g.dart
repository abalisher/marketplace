// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_cart_data.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateCartData _$UpdateCartDataFromJson(Map<String, dynamic> json) =>
    UpdateCartData(
      regionId: json['region_id'] as String?,
      customerId: json['customer_id'] as String?,
      salesChannelId: json['sales_channel_id'] as String?,
      email: json['email'] as String?,
      currencyCode: json['currency_code'] as String?,
      shippingAddressId: json['shipping_address_id'] as String?,
      billingAddressId: json['billing_address_id'] as String?,
      billingAddress: json['billing_address'] == null
          ? null
          : UpdateCartDataBillingAddressSealed.fromJson(
              json['billing_address'] as Map<String, dynamic>,
            ),
      shippingAddress: json['shipping_address'] == null
          ? null
          : UpdateCartDataShippingAddressSealed.fromJson(
              json['shipping_address'] as Map<String, dynamic>,
            ),
      metadata: json['metadata'],
    );

Map<String, dynamic> _$UpdateCartDataToJson(UpdateCartData instance) =>
    <String, dynamic>{
      'region_id': instance.regionId,
      'customer_id': instance.customerId,
      'sales_channel_id': instance.salesChannelId,
      'email': instance.email,
      'currency_code': instance.currencyCode,
      'shipping_address_id': instance.shippingAddressId,
      'billing_address_id': instance.billingAddressId,
      'billing_address': instance.billingAddress,
      'shipping_address': instance.shippingAddress,
      'metadata': instance.metadata,
    };
