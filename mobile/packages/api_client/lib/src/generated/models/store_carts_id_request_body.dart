// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'update_cart_data.dart';
import 'update_cart_data_billing_address_sealed.dart';
import 'update_cart_data_shipping_address_sealed.dart';

part 'store_carts_id_request_body.g.dart';

/// The properties to update in the cart item.
@JsonSerializable()
class StoreCartsIdRequestBody {
  const StoreCartsIdRequestBody({
    this.regionId,
    this.customerId,
    this.salesChannelId,
    this.email,
    this.currencyCode,
    this.shippingAddressId,
    this.billingAddressId,
    this.billingAddress,
    this.shippingAddress,
    this.metadata,
    this.additionalData,
  });

  factory StoreCartsIdRequestBody.fromJson(Map<String, Object?> json) =>
      _$StoreCartsIdRequestBodyFromJson(json);

  /// The ID of the associated region. This can affect the prices and currency code of the cart.
  @JsonKey(name: 'region_id')
  final String? regionId;

  /// The ID of the customer that the cart belongs to.
  @JsonKey(name: 'customer_id')
  final String? customerId;

  /// The ID of the associated sales channel. Only products available in this channel can be added to the cart.
  @JsonKey(name: 'sales_channel_id')
  final String? salesChannelId;

  /// The email of the customer that the cart belongs to.
  final String? email;

  /// The cart's currency code.
  @JsonKey(name: 'currency_code')
  final String? currencyCode;

  /// The ID of the cart's shipping address.
  @JsonKey(name: 'shipping_address_id')
  final String? shippingAddressId;

  /// The ID of the cart's billing address.
  @JsonKey(name: 'billing_address_id')
  final String? billingAddressId;
  @JsonKey(name: 'billing_address')
  final UpdateCartDataBillingAddressSealed? billingAddress;
  @JsonKey(name: 'shipping_address')
  final UpdateCartDataShippingAddressSealed? shippingAddress;

  /// The cart's metadata, ca hold custom key-value pairs.
  final dynamic metadata;

  /// Pass additional custom data to the API route. This data is passed to the underlying workflow under the `additional_data` parameter.
  @JsonKey(name: 'additional_data')
  final dynamic additionalData;

  Map<String, Object?> toJson() => _$StoreCartsIdRequestBodyToJson(this);
}
