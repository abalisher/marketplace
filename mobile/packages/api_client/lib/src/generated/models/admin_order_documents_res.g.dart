// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_documents_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderDocumentsRes _$AdminOrderDocumentsResFromJson(
  Map<String, dynamic> json,
) => AdminOrderDocumentsRes(
  documents: (json['documents'] as List<dynamic>)
      .map((e) => AdminOrderDocument.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminOrderDocumentsResToJson(
  AdminOrderDocumentsRes instance,
) => <String, dynamic>{'documents': instance.documents};
