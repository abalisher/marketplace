// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_fulfillment_provider.dart';
import 'store_shipping_option_price_type.dart';
import 'store_shipping_option_type.dart';

part 'store_shipping_option.g.dart';

/// The shipping option's details.
@JsonSerializable()
class StoreShippingOption {
  const StoreShippingOption({
    required this.id,
    required this.name,
    required this.priceType,
    required this.serviceZoneId,
    required this.providerId,
    required this.provider,
    required this.shippingOptionTypeId,
    required this.type,
    required this.shippingProfileId,
    required this.amount,
    required this.isTaxInclusive,
    required this.data,
    required this.metadata,
  });

  factory StoreShippingOption.fromJson(Map<String, Object?> json) =>
      _$StoreShippingOptionFromJson(json);

  /// The shipping option's ID.
  final String id;

  /// The shipping option's name.
  final String name;

  /// The shipping option's price type. If it's `flat`, the price is fixed and is set in the `prices` property. If it's `calculated`, the price is calculated on checkout by the associated fulfillment provider.
  @JsonKey(name: 'price_type')
  final StoreShippingOptionPriceType priceType;

  /// The ID of the service zone the shipping option belongs to.
  @JsonKey(name: 'service_zone_id')
  final String serviceZoneId;

  /// The ID of the fulfillment provider handling this option.
  @JsonKey(name: 'provider_id')
  final String providerId;
  final BaseFulfillmentProvider provider;

  /// The ID of the shipping option's type.
  @JsonKey(name: 'shipping_option_type_id')
  final String shippingOptionTypeId;
  final StoreShippingOptionType type;

  /// The ID of the associated shipping profile.
  @JsonKey(name: 'shipping_profile_id')
  final String shippingProfileId;

  /// The shipping option's amount. For a shipping option whose `price_type` is `calculated`, this amount isn't reliable until it's computed by the fulfillment provider using the [Calculate Shipping Option Price API route](https://docs.medusajs.com/api/store#shipping-options_postshippingoptionsidcalculate).
  final num amount;

  /// Whether the amount includes taxes.
  @JsonKey(name: 'is_tax_inclusive')
  final bool isTaxInclusive;

  /// The shipping option's data, useful for the provider handling fulfillment.
  final dynamic data;

  /// The shipping option's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$StoreShippingOptionToJson(this);
}
