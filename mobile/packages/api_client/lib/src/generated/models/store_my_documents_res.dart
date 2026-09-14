// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_my_document.dart';

part 'store_my_documents_res.g.dart';

@JsonSerializable()
class StoreMyDocumentsRes {
  const StoreMyDocumentsRes({required this.documents});

  factory StoreMyDocumentsRes.fromJson(Map<String, Object?> json) =>
      _$StoreMyDocumentsResFromJson(json);

  final List<StoreMyDocument> documents;

  Map<String, Object?> toJson() => _$StoreMyDocumentsResToJson(this);
}
