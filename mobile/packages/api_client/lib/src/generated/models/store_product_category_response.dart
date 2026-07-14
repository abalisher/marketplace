// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product_category.dart';

part 'store_product_category_response.g.dart';

/// The product category's details.
@JsonSerializable()
class StoreProductCategoryResponse {
  const StoreProductCategoryResponse({required this.productCategory});

  factory StoreProductCategoryResponse.fromJson(Map<String, Object?> json) =>
      _$StoreProductCategoryResponseFromJson(json);

  @JsonKey(name: 'product_category')
  final StoreProductCategory productCategory;

  Map<String, Object?> toJson() => _$StoreProductCategoryResponseToJson(this);
}
