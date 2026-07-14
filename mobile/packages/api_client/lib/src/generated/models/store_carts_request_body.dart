// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_cart_address.dart';
import 'store_cart_line_item.dart';
import 'store_create_cart.dart';

part 'store_carts_request_body.g.dart';

/// The cart's details.
@JsonSerializable()
class StoreCartsRequestBody {
  const StoreCartsRequestBody({
    this.regionId,
    this.shippingAddress,
    this.billingAddress,
    this.email,
    this.currencyCode,
    this.items,
    this.salesChannelId,
    this.metadata,
    this.additionalData,
  });

  factory StoreCartsRequestBody.fromJson(Map<String, Object?> json) =>
      _$StoreCartsRequestBodyFromJson(json);

  /// The ID of the cart's region. This affects the prices and currency of the cart.
  @JsonKey(name: 'region_id')
  final String? regionId;
  @JsonKey(name: 'shipping_address')
  final StoreCartAddress? shippingAddress;
  @JsonKey(name: 'billing_address')
  final StoreCartAddress? billingAddress;

  /// The email of the cart's customer.
  final String? email;

  /// The cart's currency code. If not provided, the region's currency is used. This affects prices in the cart, as well.
  @JsonKey(name: 'currency_code')
  final String? currencyCode;

  /// The cart's items.
  final List<StoreCartLineItem>? items;

  /// The ID of the sales channel that cart is created in. Only products available in that sales channel can be added to the cart. If not provided, the store's default sales channel is associated with the cart instead.
  @JsonKey(name: 'sales_channel_id')
  final String? salesChannelId;

  /// The cart's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// Pass additional custom data to the API route. This data is passed to the underlying workflow under the `additional_data` parameter.
  @JsonKey(name: 'additional_data')
  final dynamic additionalData;

  Map<String, Object?> toJson() => _$StoreCartsRequestBodyToJson(this);
}
