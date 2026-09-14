// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_change.dart';

part 'admin_price_stock_history_res.g.dart';

@JsonSerializable()
class AdminPriceStockHistoryRes {
  const AdminPriceStockHistoryRes({
    required this.priceChanges,
    required this.count,
    required this.offset,
    required this.limit,
  });

  factory AdminPriceStockHistoryRes.fromJson(Map<String, Object?> json) =>
      _$AdminPriceStockHistoryResFromJson(json);

  @JsonKey(name: 'price_changes')
  final List<AdminPriceChange> priceChanges;
  final num count;
  final num offset;
  final num limit;

  Map<String, Object?> toJson() => _$AdminPriceStockHistoryResToJson(this);
}
