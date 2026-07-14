// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_fulfillment_provider.dart';
import 'admin_shipping_option_price.dart';
import 'admin_shipping_option_price_type.dart';
import 'admin_shipping_option_rule.dart';
import 'admin_shipping_option_type.dart';
import 'admin_shipping_profile.dart';

part 'admin_shipping_option.g.dart';

/// The shipping option's details.
@JsonSerializable()
class AdminShippingOption {
  const AdminShippingOption({
    required this.id,
    required this.name,
    required this.priceType,
    required this.serviceZoneId,
    required this.serviceZone,
    required this.providerId,
    required this.provider,
    required this.shippingOptionTypeId,
    required this.type,
    required this.shippingProfileId,
    required this.shippingProfile,
    required this.rules,
    required this.prices,
    required this.data,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminShippingOption.fromJson(Map<String, Object?> json) =>
      _$AdminShippingOptionFromJson(json);

  /// The shipping option's ID.
  final String id;

  /// The shipping option's name.
  final String name;

  /// The shipping option's price type. If it's `flat`, the price is fixed and is set in the `prices` property. If it's `calculated`, the price is calculated on checkout by the associated fulfillment provider.
  @JsonKey(name: 'price_type')
  final AdminShippingOptionPriceType priceType;

  /// The ID of the service zone this option belongs to.
  @JsonKey(name: 'service_zone_id')
  final String serviceZoneId;
  @JsonKey(name: 'service_zone')
  final dynamic serviceZone;

  /// The ID of the provider handling fulfillments created from this shipping option.
  @JsonKey(name: 'provider_id')
  final String providerId;
  final AdminFulfillmentProvider provider;

  /// The ID of the associated shipping option type.
  @JsonKey(name: 'shipping_option_type_id')
  final String shippingOptionTypeId;
  final AdminShippingOptionType type;

  /// The ID of the associated shipping profile.
  @JsonKey(name: 'shipping_profile_id')
  final String shippingProfileId;
  @JsonKey(name: 'shipping_profile')
  final AdminShippingProfile shippingProfile;

  /// The shipping option's rules.
  final List<AdminShippingOptionRule> rules;

  /// The shipping option's prices. If the `price_type` is `calculated`, this array will be empty since the price is calculated by the fulfillment provider during checkout.
  final List<AdminShippingOptionPrice> prices;

  /// The shipping option's data, useful for the fulfillment provider handling fulfillments created from this option.
  final dynamic data;

  /// The shipping option's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the shipping option was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the shipping option was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the shipping option was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$AdminShippingOptionToJson(this);
}
