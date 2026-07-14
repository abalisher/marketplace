// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_product_category_delete_response.g.dart';

/// The details of deleting the category.
@JsonSerializable()
class AdminProductCategoryDeleteResponse {
  const AdminProductCategoryDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'product_category',
  });

  factory AdminProductCategoryDeleteResponse.fromJson(
    Map<String, Object?> json,
  ) => _$AdminProductCategoryDeleteResponseFromJson(json);

  /// The product category's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the product category was deleted.
  final bool deleted;

  Map<String, Object?> toJson() =>
      _$AdminProductCategoryDeleteResponseToJson(this);
}
