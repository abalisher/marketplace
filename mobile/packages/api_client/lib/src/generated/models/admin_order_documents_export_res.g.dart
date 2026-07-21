// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_documents_export_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderDocumentsExportRes _$AdminOrderDocumentsExportResFromJson(
  Map<String, dynamic> json,
) => AdminOrderDocumentsExportRes(
  orderId: json['order_id'] as String,
  documents: (json['documents'] as List<dynamic>)
      .map((e) => AdminOrderDocumentExport.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminOrderDocumentsExportResToJson(
  AdminOrderDocumentsExportRes instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'documents': instance.documents,
};
