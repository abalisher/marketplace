// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_stock_file_error_res_file_error.dart';

part 'admin_price_stock_file_error_res.g.dart';

/// Файл не принят целиком: ни предпросмотра, ни записи.
@JsonSerializable()
class AdminPriceStockFileErrorRes {
  const AdminPriceStockFileErrorRes({required this.message, this.fileError});

  factory AdminPriceStockFileErrorRes.fromJson(Map<String, Object?> json) =>
      _$AdminPriceStockFileErrorResFromJson(json);

  final String message;
  @JsonKey(name: 'file_error')
  final AdminPriceStockFileErrorResFileError? fileError;

  Map<String, Object?> toJson() => _$AdminPriceStockFileErrorResToJson(this);
}
