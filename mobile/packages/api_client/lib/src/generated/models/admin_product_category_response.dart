// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product_category.dart';

part 'admin_product_category_response.g.dart';

/// The product category's details.
@JsonSerializable()
class AdminProductCategoryResponse {
  const AdminProductCategoryResponse({required this.productCategory});

  factory AdminProductCategoryResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductCategoryResponseFromJson(json);

  @JsonKey(name: 'product_category')
  final AdminProductCategory productCategory;

  Map<String, Object?> toJson() => _$AdminProductCategoryResponseToJson(this);
}
