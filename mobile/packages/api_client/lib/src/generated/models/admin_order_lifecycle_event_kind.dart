// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Род записи: переход статуса или перенос слота доставки (T5.6b).
@JsonEnum()
enum AdminOrderLifecycleEventKind {
  @JsonValue('status')
  status('status'),
  @JsonValue('slot')
  slot('slot'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminOrderLifecycleEventKind(this.json);

  factory AdminOrderLifecycleEventKind.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminOrderLifecycleEventKind> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
