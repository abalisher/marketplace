// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_document.dart';

part 'admin_order_documents_res.g.dart';

@JsonSerializable()
class AdminOrderDocumentsRes {
  const AdminOrderDocumentsRes({required this.documents});

  factory AdminOrderDocumentsRes.fromJson(Map<String, Object?> json) =>
      _$AdminOrderDocumentsResFromJson(json);

  final List<AdminOrderDocument> documents;

  Map<String, Object?> toJson() => _$AdminOrderDocumentsResToJson(this);
}
