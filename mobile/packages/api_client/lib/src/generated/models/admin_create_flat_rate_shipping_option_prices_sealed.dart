// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'rules.dart';
import 'rules2.dart';

part 'admin_create_flat_rate_shipping_option_prices_sealed.g.dart';

@JsonSerializable(createFactory: false)
sealed class AdminCreateFlatRateShippingOptionPricesSealed {
  const AdminCreateFlatRateShippingOptionPricesSealed();

  factory AdminCreateFlatRateShippingOptionPricesSealed.fromJson(
    Map<String, dynamic> json,
  ) => AdminCreateFlatRateShippingOptionPricesSealedDeserializer.tryDeserialize(
    json,
  );

  Map<String, dynamic> toJson();
}

extension AdminCreateFlatRateShippingOptionPricesSealedDeserializer
    on AdminCreateFlatRateShippingOptionPricesSealed {
  static AdminCreateFlatRateShippingOptionPricesSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return AdminCreateFlatRateShippingOptionPricesSealedVariant1.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return AdminCreateFlatRateShippingOptionPricesSealedVariant2.fromJson(
        json,
      );
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for AdminCreateFlatRateShippingOptionPricesSealed from: $json',
    );
  }
}

@JsonSerializable()
class AdminCreateFlatRateShippingOptionPricesSealedVariant1
    extends AdminCreateFlatRateShippingOptionPricesSealed {
  @override
  final String currencyCode;
  @override
  final num amount;
  @override
  final List<Rules>? rules;

  const AdminCreateFlatRateShippingOptionPricesSealedVariant1({
    required this.currencyCode,
    required this.amount,
    required this.rules,
  });

  factory AdminCreateFlatRateShippingOptionPricesSealedVariant1.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminCreateFlatRateShippingOptionPricesSealedVariant1FromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$AdminCreateFlatRateShippingOptionPricesSealedVariant1ToJson(this);
}

@JsonSerializable()
class AdminCreateFlatRateShippingOptionPricesSealedVariant2
    extends AdminCreateFlatRateShippingOptionPricesSealed {
  @override
  final String regionId;
  @override
  final num amount;
  @override
  final List<Rules2>? rules;

  const AdminCreateFlatRateShippingOptionPricesSealedVariant2({
    required this.regionId,
    required this.amount,
    required this.rules,
  });

  factory AdminCreateFlatRateShippingOptionPricesSealedVariant2.fromJson(
    Map<String, dynamic> json,
  ) => _$AdminCreateFlatRateShippingOptionPricesSealedVariant2FromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$AdminCreateFlatRateShippingOptionPricesSealedVariant2ToJson(this);
}
