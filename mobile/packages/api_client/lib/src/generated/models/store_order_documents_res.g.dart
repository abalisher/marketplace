// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_order_documents_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreOrderDocumentsRes _$StoreOrderDocumentsResFromJson(
  Map<String, dynamic> json,
) => StoreOrderDocumentsRes(
  documents: (json['documents'] as List<dynamic>)
      .map((e) => StoreOrderDocument.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$StoreOrderDocumentsResToJson(
  StoreOrderDocumentsRes instance,
) => <String, dynamic>{'documents': instance.documents};
