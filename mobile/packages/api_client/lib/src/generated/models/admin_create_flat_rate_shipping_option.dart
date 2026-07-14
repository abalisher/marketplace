// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_flat_rate_shipping_option_price_type.dart';
import 'admin_create_flat_rate_shipping_option_prices_sealed.dart';
import 'admin_create_shipping_option_rule.dart';
import 'admin_create_shipping_option_type.dart';

part 'admin_create_flat_rate_shipping_option.g.dart';

/// The flat rate shipping option's details.
@JsonSerializable()
class AdminCreateFlatRateShippingOption {
  const AdminCreateFlatRateShippingOption({
    required this.name,
    required this.serviceZoneId,
    required this.shippingProfileId,
    required this.priceType,
    required this.providerId,
    required this.prices,
    this.data,
    this.type,
    this.typeId,
    this.rules,
    this.metadata,
  });

  factory AdminCreateFlatRateShippingOption.fromJson(
    Map<String, Object?> json,
  ) => _$AdminCreateFlatRateShippingOptionFromJson(json);

  /// The flat-rate shipping option's name.
  final String name;

  /// The ID of the associated service zone.
  @JsonKey(name: 'service_zone_id')
  final String serviceZoneId;

  /// The ID of the associated shipping profile.
  @JsonKey(name: 'shipping_profile_id')
  final String shippingProfileId;

  /// The flat-rate shipping option's data, useful for the fulfillment provider handling its processing.
  final dynamic data;

  /// The shipping option's price type. If `flat`, the shipping option has a fixed price set in `prices`. Otherwise, the shipping option's price is calculated by the fulfillment provider.
  @JsonKey(name: 'price_type')
  final AdminCreateFlatRateShippingOptionPriceType priceType;

  /// The ID of the fulfillment provider handling this shipping option.
  @JsonKey(name: 'provider_id')
  final String providerId;
  final AdminCreateShippingOptionType? type;

  /// The shipping option's prices.
  final List<AdminCreateFlatRateShippingOptionPricesSealed> prices;

  /// The ID of the shipping option type that this shipping option belongs to.
  @JsonKey(name: 'type_id')
  final String? typeId;

  /// The shipping option's rules.
  final List<AdminCreateShippingOptionRule>? rules;

  /// The shipping option's metadata.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminCreateFlatRateShippingOptionToJson(this);
}
