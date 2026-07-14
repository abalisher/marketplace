// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The order's payment status.
@JsonEnum()
enum AdminOrderPaymentStatus {
  @JsonValue('canceled')
  canceled('canceled'),
  @JsonValue('not_paid')
  notPaid('not_paid'),
  @JsonValue('awaiting')
  awaiting('awaiting'),
  @JsonValue('authorized')
  authorized('authorized'),
  @JsonValue('partially_authorized')
  partiallyAuthorized('partially_authorized'),
  @JsonValue('captured')
  captured('captured'),
  @JsonValue('partially_captured')
  partiallyCaptured('partially_captured'),
  @JsonValue('partially_refunded')
  partiallyRefunded('partially_refunded'),
  @JsonValue('refunded')
  refunded('refunded'),
  @JsonValue('requires_action')
  requiresAction('requires_action'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminOrderPaymentStatus(this.json);

  factory AdminOrderPaymentStatus.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminOrderPaymentStatus> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
