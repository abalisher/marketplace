// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The payment collection's status.
@JsonEnum()
enum AdminPaymentCollectionStatus {
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

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminPaymentCollectionStatus(this.json);

  factory AdminPaymentCollectionStatus.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminPaymentCollectionStatus> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
