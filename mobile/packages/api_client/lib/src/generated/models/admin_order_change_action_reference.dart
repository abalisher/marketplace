// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The name of the table this action applies on.
@JsonEnum()
enum AdminOrderChangeActionReference {
  @JsonValue('claim')
  claim('claim'),
  @JsonValue('exchange')
  exchange('exchange'),

  /// The name has been replaced because it contains a keyword. Original name: `return`.
  @JsonValue('return')
  valueReturn('return'),
  @JsonValue('order_shipping_method')
  orderShippingMethod('order_shipping_method'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminOrderChangeActionReference(this.json);

  factory AdminOrderChangeActionReference.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminOrderChangeActionReference> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
