// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

/// Почему строку принять нельзя; null — строка идёт в партию.
@JsonEnum()
enum AdminPriceStockImportRowIssue {
  @JsonValue('missing_sku')
  missingSku('missing_sku'),
  @JsonValue('unknown_sku')
  unknownSku('unknown_sku'),
  @JsonValue('duplicate_sku')
  duplicateSku('duplicate_sku'),
  @JsonValue('bad_price')
  badPrice('bad_price'),
  @JsonValue('fraction_price')
  fractionPrice('fraction_price'),
  @JsonValue('bad_stock')
  badStock('bad_stock'),
  @JsonValue('fraction_stock')
  fractionStock('fraction_stock'),
  @JsonValue('price_rules')
  priceRules('price_rules'),
  @JsonValue('stock_not_managed')
  stockNotManaged('stock_not_managed'),
  @JsonValue('location_required')
  locationRequired('location_required'),

  /// Default value for all unparsed values, allows backward compatibility when adding new values on the backend.
  $unknown(null);

  const AdminPriceStockImportRowIssue(this.json);

  factory AdminPriceStockImportRowIssue.fromJson(String json) =>
      values.firstWhere((e) => e.json == json, orElse: () => $unknown);

  final String? json;

  @override
  String toString() => json?.toString() ?? super.toString();

  /// Returns all defined enum values excluding the $unknown value.
  static List<AdminPriceStockImportRowIssue> get $valuesDefined =>
      values.where((value) => value != $unknown).toList();
}
