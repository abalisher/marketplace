// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_variant.dart';
import 'deleted2.dart';

part 'admin_batch_product_variant_response.g.dart';

/// The details of the product variants created, updated, or deleted.
@JsonSerializable()
class AdminBatchProductVariantResponse {
  const AdminBatchProductVariantResponse({
    required this.created,
    required this.updated,
    required this.deleted,
  });

  factory AdminBatchProductVariantResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminBatchProductVariantResponseFromJson(json);

  /// The created product variants.
  final List<AdminProductVariant> created;

  /// The updated product variants.
  final List<AdminProductVariant> updated;

  /// The details of the deleted product variants.
  final Deleted2 deleted;

  Map<String, Object?> toJson() =>
      _$AdminBatchProductVariantResponseToJson(this);
}
