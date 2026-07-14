// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_product.dart';

part 'store_product_response.g.dart';

/// The product's details.
@JsonSerializable()
class StoreProductResponse {
  const StoreProductResponse({required this.product});

  factory StoreProductResponse.fromJson(Map<String, Object?> json) =>
      _$StoreProductResponseFromJson(json);

  final StoreProduct product;

  Map<String, Object?> toJson() => _$StoreProductResponseToJson(this);
}
