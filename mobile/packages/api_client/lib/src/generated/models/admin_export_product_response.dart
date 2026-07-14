// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_export_product_response.g.dart';

/// The details of the product export.
@JsonSerializable()
class AdminExportProductResponse {
  const AdminExportProductResponse({required this.transactionId});

  factory AdminExportProductResponse.fromJson(Map<String, Object?> json) =>
      _$AdminExportProductResponseFromJson(json);

  /// The ID of the workflow execution's transaction. Use it to check the status of the export by sending a GET request to `/admin/workflows-executions/export-products/:transaction-id`
  @JsonKey(name: 'transaction_id')
  final String transactionId;

  Map<String, Object?> toJson() => _$AdminExportProductResponseToJson(this);
}
