// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

@JsonEnum()
enum AdminPriceStockIssueCode {
  @JsonValue('unknown_variant')
  unknownVariant('unknown_variant'),
  @JsonValue('empty_change')
  emptyChange('empty_change'),
  @JsonValue('price_rules')
  priceRules('price_rules'),
  @JsonValue('stock_not_managed')
  stockNotManaged('stock_not_managed'),
  @JsonValue('location_required')
  locationRequired('location_required'),
  @JsonValue('unknown_location')
  unknownLocation('unknown_location'),
  @JsonValue('duplicate_change')
  duplicateChange('duplicate_change'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminPriceStockIssueCode(this.json);

  factory AdminPriceStockIssueCode.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminPriceStockIssueCode> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
