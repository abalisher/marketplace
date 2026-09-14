// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_create_company_file_mime_type.dart';

part 'store_create_company_file.g.dart';

@JsonSerializable()
class StoreCreateCompanyFile {
  const StoreCreateCompanyFile({
    required this.name,
    required this.mimeType,
    required this.contentBase64,
  });

  factory StoreCreateCompanyFile.fromJson(Map<String, Object?> json) =>
      _$StoreCreateCompanyFileFromJson(json);

  /// Имя файла для модератора (показывается как есть).
  final String name;
  @JsonKey(name: 'mime_type')
  final StoreCreateCompanyFileMimeType mimeType;

  /// Содержимое файла в base64, до 3 МБ до кодирования.
  @JsonKey(name: 'content_base64')
  final String contentBase64;

  Map<String, Object?> toJson() => _$StoreCreateCompanyFileToJson(this);
}
