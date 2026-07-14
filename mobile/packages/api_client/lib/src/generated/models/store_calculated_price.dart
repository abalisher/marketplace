// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'calculated_price.dart';
import 'original_price.dart';

part 'store_calculated_price.g.dart';

/// The shipping option's calculated price.
@JsonSerializable()
class StoreCalculatedPrice {
  const StoreCalculatedPrice({
    required this.id,
    required this.calculatedAmount,
    required this.originalAmount,
    required this.currencyCode,
    required this.originalAmountWithTax,
    required this.originalAmountWithoutTax,
    this.isCalculatedPricePriceList,
    this.isCalculatedPriceTaxInclusive,
    this.calculatedAmountWithTax,
    this.calculatedAmountWithoutTax,
    this.isOriginalPricePriceList,
    this.isOriginalPriceTaxInclusive,
    this.calculatedPrice,
    this.originalPrice,
  });

  factory StoreCalculatedPrice.fromJson(Map<String, Object?> json) =>
      _$StoreCalculatedPriceFromJson(json);

  /// The ID of the price set from which the price was selected.
  final String id;

  /// Whether the calculated price belongs to a price list.
  @JsonKey(name: 'is_calculated_price_price_list')
  final bool? isCalculatedPricePriceList;

  /// Whether the calculated price is tax inclusive.
  @JsonKey(name: 'is_calculated_price_tax_inclusive')
  final bool? isCalculatedPriceTaxInclusive;

  /// The amount of the calculated price, or `null` if there isn't a calculated price. This is the amount shown to the customer.
  @JsonKey(name: 'calculated_amount')
  final num calculatedAmount;

  /// The `calculated_amount` with taxes applied.
  @JsonKey(name: 'calculated_amount_with_tax')
  final num? calculatedAmountWithTax;

  /// The `calculated_amount` without taxes applied.
  @JsonKey(name: 'calculated_amount_without_tax')
  final num? calculatedAmountWithoutTax;

  /// Whether the original price belongs to a price list.
  @JsonKey(name: 'is_original_price_price_list')
  final bool? isOriginalPricePriceList;

  /// Whether the original price is tax inclusive.
  @JsonKey(name: 'is_original_price_tax_inclusive')
  final bool? isOriginalPriceTaxInclusive;

  /// The amount of the original price, or `null` if there isn't an original price. This amount is useful to compare with the `calculated_amount`, such as to check for discounted value.
  @JsonKey(name: 'original_amount')
  final num originalAmount;

  /// The currency code of the calculated price, or `null` if there isn't a calculated price.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The calculated price's details.
  @JsonKey(name: 'calculated_price')
  final CalculatedPrice? calculatedPrice;

  /// The origin price's details.
  @JsonKey(name: 'original_price')
  final OriginalPrice? originalPrice;

  /// The original amount with taxes applied.
  @JsonKey(name: 'original_amount_with_tax')
  final num originalAmountWithTax;

  /// The original amount without taxes.
  @JsonKey(name: 'original_amount_without_tax')
  final num originalAmountWithoutTax;

  Map<String, Object?> toJson() => _$StoreCalculatedPriceToJson(this);
}
