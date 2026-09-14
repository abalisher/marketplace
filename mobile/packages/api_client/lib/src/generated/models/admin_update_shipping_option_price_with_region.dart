// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'price_rule.dart';

part 'admin_update_shipping_option_price_with_region.g.dart';

/// The properties to update in a shipping option price with a region.
@JsonSerializable()
class AdminUpdateShippingOptionPriceWithRegion {
  const AdminUpdateShippingOptionPriceWithRegion({
    this.id,
    this.regionId,
    this.amount,
    this.rules,
  });

  factory AdminUpdateShippingOptionPriceWithRegion.fromJson(
    Map<String, Object?> json,
  ) => _$AdminUpdateShippingOptionPriceWithRegionFromJson(json);

  /// The price's ID. If not provided, a new price is created; existing prices whose ID isn't included in the request are deleted.
  final String? id;

  /// The ID of the region the price is associated with.
  @JsonKey(name: 'region_id')
  final String? regionId;

  /// The price's amount.
  final num? amount;

  /// The price's rules. These rules replace the price's existing rules, so omit a rule to remove it.
  final List<PriceRule>? rules;

  Map<String, Object?> toJson() =>
      _$AdminUpdateShippingOptionPriceWithRegionToJson(this);
}
