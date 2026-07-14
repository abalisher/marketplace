// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'product.g.dart';

@JsonSerializable()
class Product {
  const Product({required this.variantId});

  factory Product.fromJson(Map<String, Object?> json) =>
      _$ProductFromJson(json);

  /// The ID of the product variant.
  @JsonKey(name: 'variant_id')
  final String variantId;

  Map<String, Object?> toJson() => _$ProductToJson(this);
}
