// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_stock_counts.dart';
import 'admin_price_stock_row.dart';
import 'locations.dart';

part 'admin_price_stock_res.g.dart';

@JsonSerializable()
class AdminPriceStockRes {
  const AdminPriceStockRes({
    required this.priceRows,
    required this.counts,
    required this.categoryCounts,
    required this.count,
    required this.offset,
    required this.limit,
    required this.lowThreshold,
    required this.scanCap,
    required this.locations,
    this.locationId,
  });

  factory AdminPriceStockRes.fromJson(Map<String, Object?> json) =>
      _$AdminPriceStockResFromJson(json);

  @JsonKey(name: 'price_rows')
  final List<AdminPriceStockRow> priceRows;
  final AdminPriceStockCounts counts;

  /// Счётчики чипов категорий: по позиции на каждую из четырёх категорий плюс other — вне ассортимента. Считаются по срезу без фильтра категории и без чипа остатка.
  @JsonKey(name: 'category_counts')
  final Map<String, num> categoryCounts;
  final num count;
  final num offset;
  final num limit;

  /// Порог «на исходе» в единицах хранения.
  @JsonKey(name: 'low_threshold')
  final num lowThreshold;

  /// Потолок просмотра каталога: позиций может быть больше — экран честно об этом говорит.
  @JsonKey(name: 'scan_cap')
  final num scanCap;

  /// Склад разреза; null — числа в строках суммарные по всем складам.
  @JsonKey(name: 'location_id')
  final String? locationId;

  /// Склады магазина — экран рисует выбор склада без второго запроса.
  final List<Locations> locations;

  Map<String, Object?> toJson() => _$AdminPriceStockResToJson(this);
}
