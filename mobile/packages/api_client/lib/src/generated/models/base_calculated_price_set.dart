// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'base_calculated_price_set.g.dart';

/// The calculated price's details.
@JsonSerializable()
class BaseCalculatedPriceSet {
  const BaseCalculatedPriceSet({
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

  factory BaseCalculatedPriceSet.fromJson(Map<String, Object?> json) =>
      _$BaseCalculatedPriceSetFromJson(json);

  /// The calculated price's ID.
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

  /// The calculated price's amount with taxes applied.
  @JsonKey(name: 'calculated_amount_with_tax')
  final num? calculatedAmountWithTax;

  /// The calculated price's amount without taxes applied.
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

  /// The calculated price's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The calculated price's details.
  @JsonKey(name: 'calculated_price')
  final dynamic calculatedPrice;

  /// The original price's details.
  @JsonKey(name: 'original_price')
  final dynamic originalPrice;

  /// The amount of the original price with taxes applied.
  @JsonKey(name: 'original_amount_with_tax')
  final num originalAmountWithTax;

  /// The amount of the original price without taxes.
  @JsonKey(name: 'original_amount_without_tax')
  final num originalAmountWithoutTax;

  Map<String, Object?> toJson() => _$BaseCalculatedPriceSetToJson(this);
}
