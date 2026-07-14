// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product.dart';

part 'admin_product_variant_delete_response.g.dart';

/// The details of the product variant's deletion.
@JsonSerializable()
class AdminProductVariantDeleteResponse {
  const AdminProductVariantDeleteResponse({
    required this.id,
    required this.object,
    required this.deleted,
    this.parent,
  });

  factory AdminProductVariantDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminProductVariantDeleteResponseFromJson(json);

  /// The product variant's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the product variant was deleted.
  final bool deleted;
  final AdminProduct? parent;

  Map<String, Object?> toJson() =>
      _$AdminProductVariantDeleteResponseToJson(this);
}
