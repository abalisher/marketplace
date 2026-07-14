// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_create_price_list_price.g.dart';

/// The details of a price to be created within a price list.
@JsonSerializable()
class AdminCreatePriceListPrice {
  const AdminCreatePriceListPrice({
    required this.currencyCode,
    required this.amount,
    required this.variantId,
    this.minQuantity,
    this.maxQuantity,
    this.rules,
  });

  factory AdminCreatePriceListPrice.fromJson(Map<String, Object?> json) =>
      _$AdminCreatePriceListPriceFromJson(json);

  /// The price's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The price's amount.
  final num amount;

  /// The ID of the product variant this price is for.
  @JsonKey(name: 'variant_id')
  final String variantId;

  /// The minimum quantity required in the cart for this price to be applied.
  @JsonKey(name: 'min_quantity')
  final num? minQuantity;

  /// The maximum quantity in the cart that shouldn't be crossed for this price to be applied.
  @JsonKey(name: 'max_quantity')
  final num? maxQuantity;

  /// The price's rules.
  final dynamic rules;

  Map<String, Object?> toJson() => _$AdminCreatePriceListPriceToJson(this);
}
