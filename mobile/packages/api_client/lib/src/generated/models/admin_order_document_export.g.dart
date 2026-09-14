// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_document_export.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderDocumentExport _$AdminOrderDocumentExportFromJson(
  Map<String, dynamic> json,
) => AdminOrderDocumentExport(
  type: AdminOrderDocumentExportType.fromJson(json['type'] as String),
  number: json['number'] as String,
  version: (json['version'] as num).toInt(),
  totalMoney: json['total_money'] as num?,
  totalBonus: json['total_bonus'] as num?,
  currencyCode: json['currency_code'] as String?,
  snapshot: json['snapshot'],
);

Map<String, dynamic> _$AdminOrderDocumentExportToJson(
  AdminOrderDocumentExport instance,
) => <String, dynamic>{
  'type': _$AdminOrderDocumentExportTypeEnumMap[instance.type]!,
  'number': instance.number,
  'version': instance.version,
  'total_money': ?instance.totalMoney,
  'total_bonus': ?instance.totalBonus,
  'currency_code': ?instance.currencyCode,
  'snapshot': ?instance.snapshot,
};

const _$AdminOrderDocumentExportTypeEnumMap = {
  AdminOrderDocumentExportType.invoice: 'invoice',
  AdminOrderDocumentExportType.waybill: 'waybill',
  AdminOrderDocumentExportType.internalAvr: 'internal_avr',
  AdminOrderDocumentExportType.$unknown: r'$unknown',
};
