// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'summary.dart';

part 'admin_import_product_response.g.dart';

/// The import process's details.
@JsonSerializable()
class AdminImportProductResponse {
  const AdminImportProductResponse({
    required this.transactionId,
    required this.summary,
  });

  factory AdminImportProductResponse.fromJson(Map<String, Object?> json) =>
      _$AdminImportProductResponseFromJson(json);

  /// The ID of the workflow execution's transaction. This is useful to confirm the import using the `/admin/products/:transaction-id/import` API route.
  @JsonKey(name: 'transaction_id')
  final String transactionId;

  /// The import's summary.
  final Summary summary;

  Map<String, Object?> toJson() => _$AdminImportProductResponseToJson(this);
}
