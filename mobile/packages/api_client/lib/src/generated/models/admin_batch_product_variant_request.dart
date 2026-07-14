// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_batch_update_product_variant.dart';
import 'admin_create_product_variant.dart';

part 'admin_batch_product_variant_request.g.dart';

/// The product variants to create, update, or delete.
@JsonSerializable()
class AdminBatchProductVariantRequest {
  const AdminBatchProductVariantRequest({
    this.create,
    this.update,
    this.delete,
  });

  factory AdminBatchProductVariantRequest.fromJson(Map<String, Object?> json) =>
      _$AdminBatchProductVariantRequestFromJson(json);

  /// The product variants to create.
  final List<AdminCreateProductVariant>? create;

  /// The product variants to update.
  final List<AdminBatchUpdateProductVariant>? update;

  /// The product variants to delete.
  final List<String>? delete;

  Map<String, Object?> toJson() =>
      _$AdminBatchProductVariantRequestToJson(this);
}
