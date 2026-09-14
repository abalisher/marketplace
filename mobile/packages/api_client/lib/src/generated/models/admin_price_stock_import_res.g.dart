// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_price_stock_import_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPriceStockImportRes _$AdminPriceStockImportResFromJson(
  Map<String, dynamic> json,
) => AdminPriceStockImportRes(
  rows: (json['rows'] as List<dynamic>)
      .map((e) => AdminPriceStockImportRow.fromJson(e as Map<String, dynamic>))
      .toList(),
  changes: (json['changes'] as List<dynamic>)
      .map((e) => AdminPriceStockChange.fromJson(e as Map<String, dynamic>))
      .toList(),
  summary: Summary3.fromJson(json['summary'] as Map<String, dynamic>),
  rowsTruncated: json['rows_truncated'] as bool?,
  locationId: json['location_id'] as String?,
  locationName: json['location_name'] as String?,
  scanCapped: json['scan_capped'] as bool?,
);

Map<String, dynamic> _$AdminPriceStockImportResToJson(
  AdminPriceStockImportRes instance,
) => <String, dynamic>{
  'rows': instance.rows,
  'changes': instance.changes,
  'summary': instance.summary,
  'rows_truncated': ?instance.rowsTruncated,
  'location_id': ?instance.locationId,
  'location_name': ?instance.locationName,
  'scan_capped': ?instance.scanCapped,
};
