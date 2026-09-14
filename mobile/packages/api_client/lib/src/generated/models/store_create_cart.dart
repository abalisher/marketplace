// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_cart_address.dart';
import 'store_cart_line_item.dart';

part 'store_create_cart.g.dart';

/// The details of the cart to be created.
@JsonSerializable()
class StoreCreateCart {
  const StoreCreateCart({
    this.regionId,
    this.shippingAddress,
    this.billingAddress,
    this.email,
    this.currencyCode,
    this.items,
    this.salesChannelId,
    this.metadata,
  });

  factory StoreCreateCart.fromJson(Map<String, Object?> json) =>
      _$StoreCreateCartFromJson(json);

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

  /// The ID of the sales channel that cart is created in. If not provided, the store's default sales channel is associated with the cart instead.
  ///
  /// A product's availability in a sales channel only filters the products you retrieve. Medusa doesn't reject a variant added to the cart when its product isn't available in the cart's sales channel. Refer to the guide in the external documentation to learn how to enforce that validation.
  ///
  @JsonKey(name: 'sales_channel_id')
  final String? salesChannelId;

  /// The cart's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$StoreCreateCartToJson(this);
}
