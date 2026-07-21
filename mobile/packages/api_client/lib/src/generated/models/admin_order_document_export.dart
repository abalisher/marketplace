// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_document_export_type.dart';

part 'admin_order_document_export.g.dart';

@JsonSerializable()
class AdminOrderDocumentExport {
  const AdminOrderDocumentExport({
    required this.type,
    required this.number,
    required this.version,
    this.totalMoney,
    this.totalBonus,
    this.currencyCode,
    this.snapshot,
  });

  factory AdminOrderDocumentExport.fromJson(Map<String, Object?> json) =>
      _$AdminOrderDocumentExportFromJson(json);

  final AdminOrderDocumentExportType type;
  final String number;
  final int version;
  @JsonKey(name: 'total_money')
  final num? totalMoney;
  @JsonKey(name: 'total_bonus')
  final num? totalBonus;
  @JsonKey(name: 'currency_code')
  final String? currencyCode;

  /// Замороженные исходные данные документа (реквизиты, позиции, суммы) на момент выпуска.
  final dynamic snapshot;

  Map<String, Object?> toJson() => _$AdminOrderDocumentExportToJson(this);
}
