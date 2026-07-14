// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// The transaction's type.
@JsonEnum()
enum AdminTransactionType {
  @JsonValue('credit')
  credit('credit'),
  @JsonValue('debit')
  debit('debit'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminTransactionType(this.json);

  factory AdminTransactionType.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminTransactionType> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
