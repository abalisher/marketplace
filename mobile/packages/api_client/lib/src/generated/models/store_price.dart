// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_price_rule.dart';

part 'store_price.g.dart';

/// The price's details.
@JsonSerializable()
class StorePrice {
  const StorePrice({
    required this.id,
    required this.currencyCode,
    required this.amount,
    required this.minQuantity,
    required this.maxQuantity,
    this.priceRules,
  });

  factory StorePrice.fromJson(Map<String, Object?> json) =>
      _$StorePriceFromJson(json);

  /// The price's ID.
  final String id;

  /// The price's ISO 2 currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The price's amount.
  final num amount;

  /// The minimum quantity required in the cart for the price to apply.
  @JsonKey(name: 'min_quantity')
  final num minQuantity;

  /// The maximum quantity required in the cart for the price to apply.
  @JsonKey(name: 'max_quantity')
  final num maxQuantity;

  /// The price's rules.
  @JsonKey(name: 'price_rules')
  final List<StorePriceRule>? priceRules;

  Map<String, Object?> toJson() => _$StorePriceToJson(this);
}
