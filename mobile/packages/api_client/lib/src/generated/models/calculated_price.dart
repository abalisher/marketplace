// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'calculated_price.g.dart';

@JsonSerializable()
class CalculatedPrice {
  const CalculatedPrice({
    required this.id,
    required this.priceListId,
    required this.priceListType,
    required this.minQuantity,
    required this.maxQuantity,
  });

  factory CalculatedPrice.fromJson(Map<String, Object?> json) =>
      _$CalculatedPriceFromJson(json);

  /// The ID of the price.
  final String id;

  /// The ID of the associated price list.
  @JsonKey(name: 'price_list_id')
  final String priceListId;

  /// The price list's type. For example, `sale` or `override`.
  @JsonKey(name: 'price_list_type')
  final String priceListType;

  /// The minimum quantity required in the cart for the price to apply.
  @JsonKey(name: 'min_quantity')
  final num minQuantity;

  /// The maximum quantity required in the cart for the price to apply.
  @JsonKey(name: 'max_quantity')
  final num maxQuantity;

  Map<String, Object?> toJson() => _$CalculatedPriceToJson(this);
}
