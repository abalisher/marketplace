// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'price_rule.dart';

part 'admin_update_shipping_option_price_with_currency.g.dart';

/// The properties to update in a shipping option price with a currency.
@JsonSerializable()
class AdminUpdateShippingOptionPriceWithCurrency {
  const AdminUpdateShippingOptionPriceWithCurrency({
    this.id,
    this.currencyCode,
    this.amount,
    this.rules,
  });

  factory AdminUpdateShippingOptionPriceWithCurrency.fromJson(
    Map<String, Object?> json,
  ) => _$AdminUpdateShippingOptionPriceWithCurrencyFromJson(json);

  /// The price's ID. If not provided, a new price is created; existing prices whose ID isn't included in the request are deleted.
  final String? id;

  /// The price's currency code.
  @JsonKey(name: 'currency_code')
  final String? currencyCode;

  /// The price's amount.
  final num? amount;

  /// The price's rules. These rules replace the price's existing rules, so omit a rule to remove it.
  final List<PriceRule>? rules;

  Map<String, Object?> toJson() =>
      _$AdminUpdateShippingOptionPriceWithCurrencyToJson(this);
}
