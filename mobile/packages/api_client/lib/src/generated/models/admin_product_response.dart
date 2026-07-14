// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product.dart';

part 'admin_product_response.g.dart';

/// The product's details.
@JsonSerializable()
class AdminProductResponse {
  const AdminProductResponse({required this.product});

  factory AdminProductResponse.fromJson(Map<String, Object?> json) =>
      _$AdminProductResponseFromJson(json);

  final AdminProduct product;

  Map<String, Object?> toJson() => _$AdminProductResponseToJson(this);
}
