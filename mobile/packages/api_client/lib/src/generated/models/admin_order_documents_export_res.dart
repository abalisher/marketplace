// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_document_export.dart';

part 'admin_order_documents_export_res.g.dart';

@JsonSerializable()
class AdminOrderDocumentsExportRes {
  const AdminOrderDocumentsExportRes({
    required this.orderId,
    required this.documents,
  });

  factory AdminOrderDocumentsExportRes.fromJson(Map<String, Object?> json) =>
      _$AdminOrderDocumentsExportResFromJson(json);

  @JsonKey(name: 'order_id')
  final String orderId;
  final List<AdminOrderDocumentExport> documents;

  Map<String, Object?> toJson() => _$AdminOrderDocumentsExportResToJson(this);
}
