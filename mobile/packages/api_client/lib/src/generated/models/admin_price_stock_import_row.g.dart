// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_stock_import_row.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceStockImportRow _$AdminPriceStockImportRowFromJson(
  Map<String, dynamic> json,
) => AdminPriceStockImportRow(
  line: (json['line'] as num).toInt(),
  sku: json['sku'] as String?,
  title: json['title'] as String?,
  variantId: json['variant_id'] as String?,
  unit: json['unit'] as String?,
  oldPrice: json['old_price'] as num?,
  newPrice: json['new_price'] as num?,
  oldStock: json['old_stock'] as num?,
  newStock: json['new_stock'] as num?,
  issue: json['issue'] == null
      ? null
      : AdminPriceStockImportRowIssue.fromJson(json['issue'] as String),
);

Map<String, dynamic> _$AdminPriceStockImportRowToJson(
  AdminPriceStockImportRow instance,
) => <String, dynamic>{
  'line': instance.line,
  'sku': ?instance.sku,
  'title': ?instance.title,
  'variant_id': ?instance.variantId,
  'unit': ?instance.unit,
  'old_price': ?instance.oldPrice,
  'new_price': ?instance.newPrice,
  'old_stock': ?instance.oldStock,
  'new_stock': ?instance.newStock,
  'issue': ?_$AdminPriceStockImportRowIssueEnumMap[instance.issue],
};

const _$AdminPriceStockImportRowIssueEnumMap = {
  AdminPriceStockImportRowIssue.missingSku: 'missing_sku',
  AdminPriceStockImportRowIssue.unknownSku: 'unknown_sku',
  AdminPriceStockImportRowIssue.duplicateSku: 'duplicate_sku',
  AdminPriceStockImportRowIssue.badPrice: 'bad_price',
  AdminPriceStockImportRowIssue.fractionPrice: 'fraction_price',
  AdminPriceStockImportRowIssue.badStock: 'bad_stock',
  AdminPriceStockImportRowIssue.fractionStock: 'fraction_stock',
  AdminPriceStockImportRowIssue.priceRules: 'price_rules',
  AdminPriceStockImportRowIssue.stockNotManaged: 'stock_not_managed',
  AdminPriceStockImportRowIssue.locationRequired: 'location_required',
  AdminPriceStockImportRowIssue.$unknown: r'$unknown',
};
