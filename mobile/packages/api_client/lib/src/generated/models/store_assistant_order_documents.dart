// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_assistant_order_document.dart';
import 'store_assistant_order_documents_type.dart';

part 'store_assistant_order_documents.g.dart';

/// Документы заказа со ссылками на PDF (счёт, накладная, внутренний акт). Покупатель открывает файл по ссылке прямо из ленты чата.
@JsonSerializable()
class StoreAssistantOrderDocuments {
  const StoreAssistantOrderDocuments({
    required this.type,
    required this.displayId,
    required this.documents,
  });

  factory StoreAssistantOrderDocuments.fromJson(Map<String, Object?> json) =>
      _$StoreAssistantOrderDocumentsFromJson(json);

  final StoreAssistantOrderDocumentsType type;

  /// Человекочитаемый номер заказа.
  @JsonKey(name: 'display_id')
  final num? displayId;
  final List<StoreAssistantOrderDocument> documents;

  Map<String, Object?> toJson() => _$StoreAssistantOrderDocumentsToJson(this);
}
