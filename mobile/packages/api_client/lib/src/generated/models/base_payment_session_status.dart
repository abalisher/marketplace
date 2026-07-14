// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The payment session's status.
@JsonEnum()
enum BasePaymentSessionStatus {
  @JsonValue('error')
  error('error'),
  @JsonValue('authorized')
  authorized('authorized'),
  @JsonValue('canceled')
  canceled('canceled'),
  @JsonValue('captured')
  captured('captured'),
  @JsonValue('pending')
  pending('pending'),
  @JsonValue('requires_more')
  requiresMore('requires_more'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const BasePaymentSessionStatus(this.json);

  factory BasePaymentSessionStatus.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<BasePaymentSessionStatus> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
