// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_import_product_request.g.dart';

/// The import's details.
@JsonSerializable()
class AdminImportProductRequest {
  const AdminImportProductRequest({required this.file});

  factory AdminImportProductRequest.fromJson(Map<String, Object?> json) =>
      _$AdminImportProductRequestFromJson(json);

  /// A File to upload.
  final dynamic file;

  Map<String, Object?> toJson() => _$AdminImportProductRequestToJson(this);
}
