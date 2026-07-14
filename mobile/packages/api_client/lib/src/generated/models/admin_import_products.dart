// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_import_products.g.dart';

/// The details of the product's import file.
@JsonSerializable()
class AdminImportProducts {
  const AdminImportProducts({
    required this.fileKey,
    required this.originalname,
    required this.extensionValue,
    required this.size,
    required this.mimeType,
  });

  factory AdminImportProducts.fromJson(Map<String, Object?> json) =>
      _$AdminImportProductsFromJson(json);

  /// The name of the file as stored in the configured File Module Provider.
  @JsonKey(name: 'file_key')
  final String fileKey;

  /// The file's original name.
  final String originalname;

  /// The file's extension.
  /// The name has been replaced because it contains a keyword. Original name: `extension`.
  @JsonKey(name: 'extension')
  final String extensionValue;

  /// The file's size in bytes.
  final num size;

  /// The file's mime type.
  @JsonKey(name: 'mime_type')
  final String mimeType;

  Map<String, Object?> toJson() => _$AdminImportProductsToJson(this);
}
