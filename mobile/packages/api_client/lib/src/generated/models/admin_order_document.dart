// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_document_type.dart';

part 'admin_order_document.g.dart';

@JsonSerializable()
class AdminOrderDocument {
  const AdminOrderDocument({
    required this.id,
    required this.type,
    required this.number,
    required this.version,
    required this.isLatest,
    this.fileId,
    this.fileUrl,
    this.totalMoney,
    this.totalBonus,
    this.currencyCode,
    this.note,
    this.createdAt,
  });

  factory AdminOrderDocument.fromJson(Map<String, Object?> json) =>
      _$AdminOrderDocumentFromJson(json);

  final String id;
  final AdminOrderDocumentType type;
  final String number;
  final int version;
  @JsonKey(name: 'is_latest')
  final bool isLatest;
  @JsonKey(name: 'file_id')
  final String? fileId;
  @JsonKey(name: 'file_url')
  final String? fileUrl;
  @JsonKey(name: 'total_money')
  final num? totalMoney;
  @JsonKey(name: 'total_bonus')
  final num? totalBonus;
  @JsonKey(name: 'currency_code')
  final String? currencyCode;
  final String? note;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  Map<String, Object?> toJson() => _$AdminOrderDocumentToJson(this);
}
