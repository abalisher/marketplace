// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_calculated_shipping_option_price_type.dart';
import 'admin_create_shipping_option_rule.dart';
import 'admin_create_shipping_option_type.dart';

part 'admin_create_calculated_shipping_option.g.dart';

/// The calculated shipping option's details.
@JsonSerializable()
class AdminCreateCalculatedShippingOption {
  const AdminCreateCalculatedShippingOption({
    required this.priceType,
    required this.name,
    required this.serviceZoneId,
    required this.shippingProfileId,
    required this.providerId,
    this.data,
    this.type,
    this.typeId,
    this.rules,
    this.metadata,
  });

  factory AdminCreateCalculatedShippingOption.fromJson(
    Map<String, Object?> json,
  ) => _$AdminCreateCalculatedShippingOptionFromJson(json);

  /// The calculated shipping option's price type.
  @JsonKey(name: 'price_type')
  final AdminCreateCalculatedShippingOptionPriceType priceType;

  /// The calculated shipping option's name.
  final String name;

  /// The ID of the associated service zone.
  @JsonKey(name: 'service_zone_id')
  final String serviceZoneId;

  /// The ID of the associated shipping profile.
  @JsonKey(name: 'shipping_profile_id')
  final String shippingProfileId;

  /// The calculated shipping option's data.
  final dynamic data;

  /// The ID of the fulfillment provider handling this calculated shipping option.
  @JsonKey(name: 'provider_id')
  final String providerId;
  final AdminCreateShippingOptionType? type;

  /// The ID of the shipping option type that this shipping option belongs to.
  @JsonKey(name: 'type_id')
  final String? typeId;

  /// The calculated shipping option's rules.
  final List<AdminCreateShippingOptionRule>? rules;

  /// The shipping option's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AdminCreateCalculatedShippingOptionToJson(this);
}
