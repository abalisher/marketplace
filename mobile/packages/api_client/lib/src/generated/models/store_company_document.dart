// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_company_document.g.dart';

@JsonSerializable()
class StoreCompanyDocument {
  const StoreCompanyDocument({required this.name, required this.url});

  factory StoreCompanyDocument.fromJson(Map<String, Object?> json) =>
      _$StoreCompanyDocumentFromJson(json);

  final String name;
  final String url;

  Map<String, Object?> toJson() => _$StoreCompanyDocumentToJson(this);
}
