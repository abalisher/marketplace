// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_order_document_doc_type.dart';

part 'store_assistant_order_document.g.dart';

@JsonSerializable()
class StoreAssistantOrderDocument {
  const StoreAssistantOrderDocument({
    required this.docType,
    required this.title,
    required this.number,
    required this.url,
  });

  factory StoreAssistantOrderDocument.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantOrderDocumentFromJson(json);

  /// Тип документа платформы.
  @JsonKey(name: 'doc_type')
  final StoreAssistantOrderDocumentDocType docType;

  /// Название документа для ленты («Счёт на оплату»).
  final String title;

  /// Человекочитаемый номер документа (INV-2026-000001).
  final String number;

  /// Ссылка на PDF; null — файл ещё рендерится.
  final String? url;

  Map<String, Object?> toJson() => _$StoreAssistantOrderDocumentToJson(this);
}
