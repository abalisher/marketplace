// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_product_variant_inventory_batch_response.g.dart';

/// The created, updated, and deleted associations between variants and inventory items.
@JsonSerializable()
class AdminProductVariantInventoryBatchResponse {
  const AdminProductVariantInventoryBatchResponse({
    required this.created,
    required this.updated,
    required this.deleted,
  });

  factory AdminProductVariantInventoryBatchResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminProductVariantInventoryBatchResponseFromJson(json);

  final dynamic created;
  final dynamic updated;
  final dynamic deleted;

  Map<String, Object?> toJson() =>
      _$AdminProductVariantInventoryBatchResponseToJson(this);
}
