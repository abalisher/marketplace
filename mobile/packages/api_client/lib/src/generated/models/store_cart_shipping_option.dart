// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'provider.dart';
import 'store_calculated_price.dart';
import 'store_cart_shipping_option_price_type.dart';
import 'store_price.dart';
import 'type.dart';

part 'store_cart_shipping_option.g.dart';

/// The shipping option's details.
@JsonSerializable()
class StoreCartShippingOption {
  const StoreCartShippingOption({
    required this.id,
    required this.name,
    required this.priceType,
    required this.serviceZoneId,
    required this.providerId,
    required this.provider,
    required this.type,
    required this.shippingProfileId,
    required this.amount,
    required this.data,
    required this.prices,
    required this.calculatedPrice,
    required this.insufficientInventory,
  });

  factory StoreCartShippingOption.fromJson(Map<String, Object?> json) =>
      _$StoreCartShippingOptionFromJson(json);

  /// The shipping option's ID.
  final String id;

  /// The shipping option's name.
  final String name;

  /// The shipping option's price type. If it's `flat`, the price is fixed and is set in the `prices` property. If it's `calculated`, the price is calculated on checkout by the associated fulfillment provider.
  @JsonKey(name: 'price_type')
  final StoreCartShippingOptionPriceType priceType;

  /// The ID of the service zone the shipping option belongs to.
  @JsonKey(name: 'service_zone_id')
  final String serviceZoneId;

  /// The ID of the fulfillment provider handling this option.
  @JsonKey(name: 'provider_id')
  final String providerId;

  /// The fulfillment provider's details.
  final Provider provider;

  /// The shipping option type's details.
  final Type type;

  /// The ID of the associated shipping profile.
  @JsonKey(name: 'shipping_profile_id')
  final String shippingProfileId;

  /// The shipping option's amount for the cart. For a shipping option whose `price_type` is `calculated`, this amount is computed on the fly by the fulfillment provider against the cart.
  final num amount;

  /// The shipping option's data, useful for the provider handling fulfillment.
  final dynamic data;

  /// The shipping option's prices.
  final List<StorePrice> prices;
  @JsonKey(name: 'calculated_price')
  final StoreCalculatedPrice calculatedPrice;

  /// Whether the shipping option's location doesn't have sufficient quantity for any of the cart's items.
  @JsonKey(name: 'insufficient_inventory')
  final bool insufficientInventory;

  Map<String, Object?> toJson() => _$StoreCartShippingOptionToJson(this);
}
