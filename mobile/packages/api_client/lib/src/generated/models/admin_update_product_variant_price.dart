// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_product_variant_price.g.dart';

/// The details of a variant's price.
@JsonSerializable()
class AdminUpdateProductVariantPrice {
  const AdminUpdateProductVariantPrice({
    this.currencyCode,
    this.amount,
    this.minQuantity,
    this.maxQuantity,
    this.rules,
    this.id,
  });

  factory AdminUpdateProductVariantPrice.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateProductVariantPriceFromJson(json);

  /// The price's currency code.
  @JsonKey(name: 'currency_code')
  final String? currencyCode;

  /// The price's amount.
  final num? amount;

  /// The minimum quantity that must be available in the cart for this price to apply.
  @JsonKey(name: 'min_quantity')
  final num? minQuantity;

  /// The maximum quantity that must not be surpassed in the cart for this price to apply.
  @JsonKey(name: 'max_quantity')
  final num? maxQuantity;

  /// The price's rules.
  final dynamic rules;

  /// The price's ID.
  final String? id;

  Map<String, Object?> toJson() => _$AdminUpdateProductVariantPriceToJson(this);
}
