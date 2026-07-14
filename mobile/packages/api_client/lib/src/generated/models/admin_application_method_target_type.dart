// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Which item does the promotion apply to. `items` mean the promotion applies to the cart's items; `shipping_methods` means the promotion applies to the cart's shipping methods; `order` means the promotion applies on the entire order.
@JsonEnum()
enum AdminApplicationMethodTargetType {
  @JsonValue('items')
  items('items'),
  @JsonValue('shipping_methods')
  shippingMethods('shipping_methods'),
  @JsonValue('order')
  order('order'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminApplicationMethodTargetType(this.json);

  factory AdminApplicationMethodTargetType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminApplicationMethodTargetType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
