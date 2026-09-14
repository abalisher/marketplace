// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_my_document.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreMyDocument _$StoreMyDocumentFromJson(Map<String, dynamic> json) =>
    StoreMyDocument(
      id: json['id'] as String,
      type: StoreMyDocumentType.fromJson(json['type'] as String),
      number: json['number'] as String,
      version: (json['version'] as num).toInt(),
      order: StoreMyDocumentOrder.fromJson(
        json['order'] as Map<String, dynamic>,
      ),
      fileUrl: json['file_url'] as String?,
      totalMoney: json['total_money'] as num?,
      totalBonus: json['total_bonus'] as num?,
      currencyCode: json['currency_code'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$StoreMyDocumentToJson(StoreMyDocument instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': _$StoreMyDocumentTypeEnumMap[instance.type]!,
      'number': instance.number,
      'version': instance.version,
      'file_url': ?instance.fileUrl,
      'total_money': ?instance.totalMoney,
      'total_bonus': ?instance.totalBonus,
      'currency_code': ?instance.currencyCode,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'order': instance.order,
    };

const _$StoreMyDocumentTypeEnumMap = {
  StoreMyDocumentType.invoice: 'invoice',
  StoreMyDocumentType.waybill: 'waybill',
  StoreMyDocumentType.internalAvr: 'internal_avr',
  StoreMyDocumentType.$unknown: r'$unknown',
};
