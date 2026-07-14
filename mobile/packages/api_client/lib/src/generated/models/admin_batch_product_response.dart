// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product.dart';
import 'deleted.dart';

part 'admin_batch_product_response.g.dart';

/// The details of the products created, updated, or deleted.
@JsonSerializable()
class AdminBatchProductResponse {
  const AdminBatchProductResponse({
    required this.created,
    required this.updated,
    required this.deleted,
  });

  factory AdminBatchProductResponse.fromJson(Map<String, Object?> json) =>
      _$AdminBatchProductResponseFromJson(json);

  /// The created products
  final List<AdminProduct> created;

  /// The updated products.
  final List<AdminProduct> updated;

  /// The deleted products' details.
  final Deleted deleted;

  Map<String, Object?> toJson() => _$AdminBatchProductResponseToJson(this);
}
