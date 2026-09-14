// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_export_inventory_item_response.g.dart';

/// The response for initiating an export inventory items workflow.
@JsonSerializable()
class AdminExportInventoryItemResponse {
  const AdminExportInventoryItemResponse({required this.transactionId});

  factory AdminExportInventoryItemResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminExportInventoryItemResponseFromJson(json);

  /// The ID of the workflow execution's transaction. Use it to check the status of the export by sending a GET request to `/admin/workflows-executions/export-inventory-items/:transaction-id`
  @JsonKey(name: 'transaction_id')
  final String transactionId;

  Map<String, Object?> toJson() =>
      _$AdminExportInventoryItemResponseToJson(this);
}
