// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_order_document.dart';

part 'store_order_documents_res.g.dart';

@JsonSerializable()
class StoreOrderDocumentsRes {
  const StoreOrderDocumentsRes({required this.documents});

  factory StoreOrderDocumentsRes.fromJson(Map<String, Object?> json) =>
      _$StoreOrderDocumentsResFromJson(json);

  final List<StoreOrderDocument> documents;

  Map<String, Object?> toJson() => _$StoreOrderDocumentsResToJson(this);
}
