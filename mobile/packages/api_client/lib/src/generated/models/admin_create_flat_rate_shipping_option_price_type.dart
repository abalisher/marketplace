// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The shipping option's price type. If `flat`, the shipping option has a fixed price set in `prices`. Otherwise, the shipping option's price is calculated by the fulfillment provider.
@JsonEnum()
enum AdminCreateFlatRateShippingOptionPriceType {
  @JsonValue('flat')
  flat('flat'),
  @JsonValue('calculated')
  calculated('calculated'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminCreateFlatRateShippingOptionPriceType(this.json);

  factory AdminCreateFlatRateShippingOptionPriceType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminCreateFlatRateShippingOptionPriceType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
