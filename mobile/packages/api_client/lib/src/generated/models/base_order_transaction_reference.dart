// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The name of a table that this transaction references. If this transaction is for captured payment, its value is `capture`. If this transaction is for refunded payment, its value is `refund`.
@JsonEnum()
enum BaseOrderTransactionReference {
  @JsonValue('capture')
  capture('capture'),
  @JsonValue('refund')
  refund('refund'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const BaseOrderTransactionReference(this.json);

  factory BaseOrderTransactionReference.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<BaseOrderTransactionReference> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
