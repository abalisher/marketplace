// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_batch_update_product.dart';
import 'admin_create_product.dart';

part 'admin_batch_product_request.g.dart';

/// The products to create, update, or delete.
@JsonSerializable()
class AdminBatchProductRequest {
  const AdminBatchProductRequest({this.create, this.update, this.delete});

  factory AdminBatchProductRequest.fromJson(Map<String, Object?> json) =>
      _$AdminBatchProductRequestFromJson(json);

  /// The products to create.
  final List<AdminCreateProduct>? create;

  /// The products to update.
  final List<AdminBatchUpdateProduct>? update;

  /// The products to delete.
  final List<String>? delete;

  Map<String, Object?> toJson() => _$AdminBatchProductRequestToJson(this);
}
