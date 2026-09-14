// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_stock_change.dart';
import 'admin_price_stock_import_row.dart';
import 'summary3.dart';

part 'admin_price_stock_import_res.g.dart';

@JsonSerializable()
class AdminPriceStockImportRes {
  const AdminPriceStockImportRes({
    required this.rows,
    required this.changes,
    required this.summary,
    this.rowsTruncated,
    this.locationId,
    this.locationName,
    this.scanCapped,
  });

  factory AdminPriceStockImportRes.fromJson(Map<String, Object?> json) =>
      _$AdminPriceStockImportResFromJson(json);

  /// Только строки с правкой и строки с проблемой: «не изменилось» перечислять незачем.
  final List<AdminPriceStockImportRow> rows;

  /// Готовая партия для POST /admin/price-stock.
  final List<AdminPriceStockChange> changes;
  final Summary3 summary;

  /// Строк с правками больше, чем показано: остальные посчитаны в сводке.
  @JsonKey(name: 'rows_truncated')
  final bool? rowsTruncated;

  /// Склад, на который уедут остатки.
  @JsonKey(name: 'location_id')
  final String? locationId;
  @JsonKey(name: 'location_name')
  final String? locationName;

  /// Каталог упёрся в потолок просмотра: «нет в каталоге» в такой сверке — не приговор.
  @JsonKey(name: 'scan_capped')
  final bool? scanCapped;

  Map<String, Object?> toJson() => _$AdminPriceStockImportResToJson(this);
}
