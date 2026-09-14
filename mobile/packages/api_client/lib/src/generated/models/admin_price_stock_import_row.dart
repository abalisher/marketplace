// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_stock_import_row_issue.dart';

part 'admin_price_stock_import_row.g.dart';

/// Строка предпросмотра: номер строки В ФАЙЛЕ (её продавец правит в Excel), найденная позиция и пара «было → станет». new_* = null — эту величину файл не трогает.
@JsonSerializable()
class AdminPriceStockImportRow {
  const AdminPriceStockImportRow({
    required this.line,
    required this.sku,
    this.title,
    this.variantId,
    this.unit,
    this.oldPrice,
    this.newPrice,
    this.oldStock,
    this.newStock,
    this.issue,
  });

  factory AdminPriceStockImportRow.fromJson(Map<String, Object?> json) =>
      _$AdminPriceStockImportRowFromJson(json);

  /// Номер строки файла (заголовок — первая).
  final int line;
  final String? sku;
  final String? title;
  @JsonKey(name: 'variant_id')
  final String? variantId;
  final String? unit;
  @JsonKey(name: 'old_price')
  final num? oldPrice;
  @JsonKey(name: 'new_price')
  final num? newPrice;
  @JsonKey(name: 'old_stock')
  final num? oldStock;
  @JsonKey(name: 'new_stock')
  final num? newStock;

  /// Почему строку принять нельзя; null — строка идёт в партию.
  final AdminPriceStockImportRowIssue? issue;

  Map<String, Object?> toJson() => _$AdminPriceStockImportRowToJson(this);
}
