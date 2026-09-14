// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_document.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderDocument _$AdminOrderDocumentFromJson(Map<String, dynamic> json) =>
    AdminOrderDocument(
      id: json['id'] as String,
      type: AdminOrderDocumentType.fromJson(json['type'] as String),
      number: json['number'] as String,
      version: (json['version'] as num).toInt(),
      isLatest: json['is_latest'] as bool,
      fileId: json['file_id'] as String?,
      fileUrl: json['file_url'] as String?,
      totalMoney: json['total_money'] as num?,
      totalBonus: json['total_bonus'] as num?,
      currencyCode: json['currency_code'] as String?,
      note: json['note'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$AdminOrderDocumentToJson(AdminOrderDocument instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$AdminOrderDocumentTypeEnumMap[instance.type]!,
      'number': instance.number,
      'version': instance.version,
      'is_latest': instance.isLatest,
      'file_id': ?instance.fileId,
      'file_url': ?instance.fileUrl,
      'total_money': ?instance.totalMoney,
      'total_bonus': ?instance.totalBonus,
      'currency_code': ?instance.currencyCode,
      'note': ?instance.note,
      'created_at': ?instance.createdAt?.toIso8601String(),
    };

const _$AdminOrderDocumentTypeEnumMap = {
  AdminOrderDocumentType.invoice: 'invoice',
  AdminOrderDocumentType.waybill: 'waybill',
  AdminOrderDocumentType.internalAvr: 'internal_avr',
  AdminOrderDocumentType.$unknown: r'$unknown',
};
