// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Способ получения заказа. Кода получения в admin-ответах нет — он секрет покупателя.
@JsonEnum()
enum AdminOrderLifecycleResDeliveryMethod {
  @JsonValue('delivery')
  delivery('delivery'),
  @JsonValue('pickup')
  pickup('pickup'),
  @JsonValue('counter')
  counter('counter'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminOrderLifecycleResDeliveryMethod(this.json);

  factory AdminOrderLifecycleResDeliveryMethod.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminOrderLifecycleResDeliveryMethod> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
