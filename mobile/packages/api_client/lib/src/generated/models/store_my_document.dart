// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_my_document_order.dart';
import 'store_my_document_type.dart';

part 'store_my_document.g.dart';

@JsonSerializable()
class StoreMyDocument {
  const StoreMyDocument({
    required this.id,
    required this.type,
    required this.number,
    required this.version,
    required this.order,
    this.fileUrl,
    this.totalMoney,
    this.totalBonus,
    this.currencyCode,
    this.createdAt,
  });

  factory StoreMyDocument.fromJson(Map<String, Object?> json) =>
      _$StoreMyDocumentFromJson(json);

  final String id;

  /// Тип документа: счёт / накладная / внутренний АВР.
  final StoreMyDocumentType type;

  /// Человекочитаемый номер (напр. INV-2026-000001).
  final String number;
  final int version;

  /// Ссылка на PDF в File Module (для скачивания).
  @JsonKey(name: 'file_url')
  final String? fileUrl;
  @JsonKey(name: 'total_money')
  final num? totalMoney;
  @JsonKey(name: 'total_bonus')
  final num? totalBonus;
  @JsonKey(name: 'currency_code')
  final String? currencyCode;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  final StoreMyDocumentOrder order;

  Map<String, Object?> toJson() => _$StoreMyDocumentToJson(this);
}
