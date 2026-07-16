// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Способ получения: доставка (приёмка по коду получения) или самовывоз у окна склада (по накладной). Продажа у окна (counter) покупателю недоступна — оформляется продавцом.
@JsonEnum()
enum StorePlaceOrderDeliveryMethod {
  @JsonValue('delivery')
  delivery('delivery'),
  @JsonValue('pickup')
  pickup('pickup'),

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
