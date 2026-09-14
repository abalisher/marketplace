// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_price_stock_counts.g.dart';

@JsonSerializable()
class AdminPriceStockCounts {
  const AdminPriceStockCounts({
    required this.total,
    required this.zero,
    required this.low,
  });

  factory AdminPriceStockCounts.fromJson(Map<String, Object?> json) =>
      _$AdminPriceStockCountsFromJson(json);

  final num total;
  final num zero;
  final num low;

  Map<String, Object?> toJson() => _$AdminPriceStockCountsToJson(this);
}
