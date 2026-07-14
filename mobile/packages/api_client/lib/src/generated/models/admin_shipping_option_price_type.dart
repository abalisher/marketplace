// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The shipping option's price type. If it's `flat`, the price is fixed and is set in the `prices` property. If it's `calculated`, the price is calculated on checkout by the associated fulfillment provider.
@JsonEnum()
enum AdminShippingOptionPriceType {
  @JsonValue('calculated')
  calculated('calculated'),
  @JsonValue('flat')
  flat('flat'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminShippingOptionPriceType(this.json);

  factory AdminShippingOptionPriceType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminShippingOptionPriceType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
