// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// ТОЛЬКО для мока (dev/тесты): детерминированный исход оплаты инвойса. В live-режиме игнорируется.
@JsonEnum()
enum StoreInitKaspiPaymentScenario {
  @JsonValue('pending')
  pending('pending'),
  @JsonValue('paid')
  paid('paid'),
  @JsonValue('canceled')
  canceled('canceled'),
  @JsonValue('error')
  error('error'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const StoreInitKaspiPaymentScenario(this.json);

  factory StoreInitKaspiPaymentScenario.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<StoreInitKaspiPaymentScenario> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
