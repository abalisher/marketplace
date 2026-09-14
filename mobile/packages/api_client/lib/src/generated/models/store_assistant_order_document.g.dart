// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_order_document.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantOrderDocument _$StoreAssistantOrderDocumentFromJson(
  Map<String, dynamic> json,
) => StoreAssistantOrderDocument(
  docType: StoreAssistantOrderDocumentDocType.fromJson(
    json['doc_type'] as String,
  ),
  title: json['title'] as String,
  number: json['number'] as String,
  url: json['url'] as String?,
);

Map<String, dynamic> _$StoreAssistantOrderDocumentToJson(
  StoreAssistantOrderDocument instance,
) => <String, dynamic>{
  'doc_type': _$StoreAssistantOrderDocumentDocTypeEnumMap[instance.docType]!,
  'title': instance.title,
  'number': instance.number,
  'url': ?instance.url,
};

const _$StoreAssistantOrderDocumentDocTypeEnumMap = {
  StoreAssistantOrderDocumentDocType.invoice: 'invoice',
  StoreAssistantOrderDocumentDocType.waybill: 'waybill',
  StoreAssistantOrderDocumentDocType.internalAvr: 'internal_avr',
  StoreAssistantOrderDocumentDocType.$unknown: r'$unknown',
};
