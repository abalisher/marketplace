// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_init_kaspi_payment_scenario.dart';

part 'store_init_kaspi_payment.g.dart';

@JsonSerializable()
class StoreInitKaspiPayment {
  const StoreInitKaspiPayment({this.scenario});

  factory StoreInitKaspiPayment.fromJson(Map<String, Object?> json) =>
      _$StoreInitKaspiPaymentFromJson(json);

  /// ТОЛЬКО для мока (dev/тесты): детерминированный исход оплаты инвойса. В live-режиме игнорируется.
  final StoreInitKaspiPaymentScenario? scenario;

  Map<String, Object?> toJson() => _$StoreInitKaspiPaymentToJson(this);
}
