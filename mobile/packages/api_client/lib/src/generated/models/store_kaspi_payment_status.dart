// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Статус сессии ядра. authorized/captured — оплачено, можно оформлять заказ.
@JsonEnum()
enum StoreKaspiPaymentStatus {
  @JsonValue('pending')
  pending('pending'),
  @JsonValue('requires_more')
  requiresMore('requires_more'),
  @JsonValue('authorized')
  authorized('authorized'),
  @JsonValue('captured')
  captured('captured'),
  @JsonValue('canceled')
  canceled('canceled'),
  @JsonValue('error')
  error('error'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const StoreKaspiPaymentStatus(this.json);

  factory StoreKaspiPaymentStatus.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<StoreKaspiPaymentStatus> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
