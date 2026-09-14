// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_stock_row.dart';

part 'admin_apply_price_stock_res.g.dart';

@JsonSerializable()
class AdminApplyPriceStockRes {
  const AdminApplyPriceStockRes({
    required this.applied,
    required this.skipped,
    required this.priceRows,
  });

  factory AdminApplyPriceStockRes.fromJson(Map<String, Object?> json) =>
      _$AdminApplyPriceStockResFromJson(json);

  final num applied;

  /// Сколько правок совпало с текущими числами и не записывалось.
  final num skipped;
  @JsonKey(name: 'price_rows')
  final List<AdminPriceStockRow> priceRows;

  Map<String, Object?> toJson() => _$AdminApplyPriceStockResToJson(this);
}
