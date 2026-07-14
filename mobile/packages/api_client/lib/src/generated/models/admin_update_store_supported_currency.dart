// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_store_supported_currency.g.dart';

/// The details to update in a supported currency of the store.
@JsonSerializable()
class AdminUpdateStoreSupportedCurrency {
  const AdminUpdateStoreSupportedCurrency({
    required this.currencyCode,
    this.isDefault,
    this.isTaxInclusive,
  });

  factory AdminUpdateStoreSupportedCurrency.fromJson(
    Map<String, Object?> json,
  ) => _$AdminUpdateStoreSupportedCurrencyFromJson(json);

  /// The currency's code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// Whether the currency is the default in the store.
  @JsonKey(name: 'is_default')
  final bool? isDefault;

  /// Whether prices using this currency are tax inclusive.
  @JsonKey(name: 'is_tax_inclusive')
  final bool? isTaxInclusive;

  Map<String, Object?> toJson() =>
      _$AdminUpdateStoreSupportedCurrencyToJson(this);
}
