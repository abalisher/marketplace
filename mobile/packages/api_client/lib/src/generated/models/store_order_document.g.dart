// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_document.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderDocument _$StoreOrderDocumentFromJson(Map<String, dynamic> json) =>
    StoreOrderDocument(
      id: json['id'] as String,
      type: StoreOrderDocumentType.fromJson(json['type'] as String),
      number: json['number'] as String,
      version: (json['version'] as num).toInt(),
      fileUrl: json['file_url'] as String?,
      totalMoney: json['total_money'] as num?,
      totalBonus: json['total_bonus'] as num?,
      currencyCode: json['currency_code'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$StoreOrderDocumentToJson(StoreOrderDocument instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$StoreOrderDocumentTypeEnumMap[instance.type]!,
      'number': instance.number,
      'version': instance.version,
      'file_url': instance.fileUrl,
      'total_money': instance.totalMoney,
      'total_bonus': instance.totalBonus,
      'currency_code': instance.currencyCode,
      'created_at': instance.createdAt?.toIso8601String(),
    };

const _$StoreOrderDocumentTypeEnumMap = {
  StoreOrderDocumentType.invoice: 'invoice',
  StoreOrderDocumentType.waybill: 'waybill',
  StoreOrderDocumentType.internalAvr: 'internal_avr',
  StoreOrderDocumentType.$unknown: r'$unknown',
};
