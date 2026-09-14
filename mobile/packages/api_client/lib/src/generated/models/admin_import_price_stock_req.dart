// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_import_price_stock_req.g.dart';

/// Загруженный файл: содержимое base64 (multipart ради одного экрана не заводим) и разрез склада, для которого набраны остатки.
@JsonSerializable()
class AdminImportPriceStockReq {
  const AdminImportPriceStockReq({
    required this.contentBase64,
    this.fileName,
    this.locationId,
  });

  factory AdminImportPriceStockReq.fromJson(Map<String, Object?> json) =>
      _$AdminImportPriceStockReqFromJson(json);

  /// Имя файла — для сообщения об отказе.
  @JsonKey(name: 'file_name')
  final String? fileName;

  /// Содержимое файла CSV в base64.
  @JsonKey(name: 'content_base64')
  final String contentBase64;

  /// Склад, который смотрит экран: на него уедут остатки, если в файле нет своей колонки «Склад». Если файл называет ДРУГОЙ склад — отказ (location_mismatch).
  @JsonKey(name: 'location_id')
  final String? locationId;

  Map<String, Object?> toJson() => _$AdminImportPriceStockReqToJson(this);
}
