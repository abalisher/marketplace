// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_shipping_option_type.dart';
import 'admin_update_shipping_option_price_type.dart';
import 'admin_update_shipping_option_prices_sealed.dart';
import 'admin_update_shipping_option_rules_sealed.dart';

part 'admin_update_shipping_option.g.dart';

/// The properties to update in the shipping option type.
@JsonSerializable()
class AdminUpdateShippingOption {
  const AdminUpdateShippingOption({
    this.name,
    this.data,
    this.priceType,
    this.providerId,
    this.shippingProfileId,
    this.type,
    this.typeId,
    this.prices,
    this.rules,
    this.metadata,
  });

  factory AdminUpdateShippingOption.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateShippingOptionFromJson(json);

  /// The shipping option's name.
  final String? name;

  /// The shipping option's data.
  final dynamic data;

  /// The shipping option's price type.
  @JsonKey(name: 'price_type')
  final AdminUpdateShippingOptionPriceType? priceType;

  /// The shipping option's provider id.
  @JsonKey(name: 'provider_id')
  final String? providerId;

  /// The shipping option's shipping profile id.
  @JsonKey(name: 'shipping_profile_id')
  final String? shippingProfileId;
  final AdminCreateShippingOptionType? type;

  /// The shipping option's type id.
  @JsonKey(name: 'type_id')
  final String? typeId;

  /// The shipping option's prices. This array replaces the shipping option's existing prices - a price with a matching `id` is updated, a price without an `id` is created, and any existing price whose `id` isn't included is deleted. Omit this property to leave the existing prices unchanged.
  final List<AdminUpdateShippingOptionPricesSealed>? prices;

  /// The shipping option's rules.
  final List<AdminUpdateShippingOptionRulesSealed>? rules;

  /// The shipping option's metadata.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateShippingOptionToJson(this);
}
