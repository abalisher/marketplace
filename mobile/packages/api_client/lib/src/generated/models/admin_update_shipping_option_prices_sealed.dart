// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'price_rule.dart';
import 'admin_update_shipping_option_price_with_currency.dart';
import 'admin_update_shipping_option_price_with_region.dart';

part 'admin_update_shipping_option_prices_sealed.g.dart';

@JsonSerializable(createFactory: false)
sealed class AdminUpdateShippingOptionPricesSealed {
  const AdminUpdateShippingOptionPricesSealed();

  factory AdminUpdateShippingOptionPricesSealed.fromJson(
    Map<String, dynamic> json,
  ) => AdminUpdateShippingOptionPricesSealedDeserializer.tryDeserialize(json);

  Map<String, dynamic> toJson();
}

extension AdminUpdateShippingOptionPricesSealedDeserializer
    on AdminUpdateShippingOptionPricesSealed {
  static AdminUpdateShippingOptionPricesSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithCurrency.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithRegion.fromJson(
        json,
      );
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for AdminUpdateShippingOptionPricesSealed from: $json',
    );
  }
}

@JsonSerializable()
class AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithCurrency
    extends AdminUpdateShippingOptionPricesSealed
    implements AdminUpdateShippingOptionPriceWithCurrency {
  @override
  final String? id;
  @override
  final String? currencyCode;
  @override
  final num? amount;
  @override
  final List<PriceRule>? rules;

  const AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithCurrency({
    required this.id,
    required this.currencyCode,
    required this.amount,
    required this.rules,
  });

  factory AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithCurrency.fromJson(
    Map<String, dynamic> json,
  ) =>
      _$AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithCurrencyFromJson(
        json,
      );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithCurrencyToJson(
        this,
      );
}

@JsonSerializable()
class AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithRegion
    extends AdminUpdateShippingOptionPricesSealed
    implements AdminUpdateShippingOptionPriceWithRegion {
  @override
  final String? id;
  @override
  final String? regionId;
  @override
  final num? amount;
  @override
  final List<PriceRule>? rules;

  const AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithRegion({
    required this.id,
    required this.regionId,
    required this.amount,
    required this.rules,
  });

  factory AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithRegion.fromJson(
    Map<String, dynamic> json,
  ) =>
      _$AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithRegionFromJson(
        json,
      );

  @override
  Map<String, dynamic> toJson() =>
      _$AdminUpdateShippingOptionPricesSealedAdminUpdateShippingOptionPriceWithRegionToJson(
        this,
      );
}
