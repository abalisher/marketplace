// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Способ получения заказа. После пивота 2026-07-22 единственный способ — доставка (приёмка по коду получения).
@JsonEnum()
enum StorePlaceOrderDeliveryMethod {
  @JsonValue('delivery')
  delivery('delivery'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const StorePlaceOrderDeliveryMethod(this.json);

  factory StorePlaceOrderDeliveryMethod.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<StorePlaceOrderDeliveryMethod> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
