// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_assistant_order_documents.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreAssistantOrderDocuments _$StoreAssistantOrderDocumentsFromJson(
  Map<String, dynamic> json,
) => StoreAssistantOrderDocuments(
  type: StoreAssistantOrderDocumentsType.fromJson(json['type'] as String),
  displayId: json['display_id'] as num?,
  documents: (json['documents'] as List<dynamic>)
      .map(
        (e) => StoreAssistantOrderDocument.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
);

Map<String, dynamic> _$StoreAssistantOrderDocumentsToJson(
  StoreAssistantOrderDocuments instance,
) => <String, dynamic>{
  'type': _$StoreAssistantOrderDocumentsTypeEnumMap[instance.type]!,
  'display_id': ?instance.displayId,
  'documents': instance.documents,
};

const _$StoreAssistantOrderDocumentsTypeEnumMap = {
  StoreAssistantOrderDocumentsType.documents: 'documents',
  StoreAssistantOrderDocumentsType.$unknown: r'$unknown',
};
