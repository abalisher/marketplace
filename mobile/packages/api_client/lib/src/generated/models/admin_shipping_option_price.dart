// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_shipping_option_price_rule.dart';

part 'admin_shipping_option_price.g.dart';

/// The details of the shipping option's price.
@JsonSerializable()
class AdminShippingOptionPrice {
  const AdminShippingOptionPrice({
    required this.priceRules,
    required this.rulesCount,
    required this.id,
    required this.title,
    required this.currencyCode,
    required this.amount,
    required this.rawAmount,
    required this.minQuantity,
    required this.maxQuantity,
    required this.priceSetId,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminShippingOptionPrice.fromJson(Map<String, Object?> json) =>
      _$AdminShippingOptionPriceFromJson(json);

  /// The price's rules.
  @JsonKey(name: 'price_rules')
  final List<AdminShippingOptionPriceRule> priceRules;

  /// The number of rules the price has.
  @JsonKey(name: 'rules_count')
  final num rulesCount;

  /// The price's ID.
  final String id;

  /// The price's title.
  final String title;

  /// The price's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The price's amount.
  final num amount;

  /// The price's raw amount.
  @JsonKey(name: 'raw_amount')
  final dynamic rawAmount;

  /// The minimum quantity required in the cart for this price to apply.
  @JsonKey(name: 'min_quantity')
  final num minQuantity;

  /// The maximum quantity that the cart's items must not surpass for this price to apply.
  @JsonKey(name: 'max_quantity')
  final num maxQuantity;

  /// The ID of the price set this price belongs to.
  @JsonKey(name: 'price_set_id')
  final String priceSetId;

  /// The date the price was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the price was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the price was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminShippingOptionPriceToJson(this);
}
