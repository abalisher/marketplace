// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Окно приезда машины: morning 09:00–13:00, day 13:00–17:00, evening 17:00–21:00.
@JsonEnum()
enum AdminOrderLifecycleDeliveryWindow {
  @JsonValue('morning')
  morning('morning'),
  @JsonValue('day')
  day('day'),
  @JsonValue('evening')
  evening('evening'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminOrderLifecycleDeliveryWindow(this.json);

  factory AdminOrderLifecycleDeliveryWindow.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminOrderLifecycleDeliveryWindow> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
