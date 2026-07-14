// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_product.dart';
import 'store_product_option_value.dart';

part 'store_product_option.g.dart';

/// The product option's details.
@JsonSerializable()
class StoreProductOption {
  const StoreProductOption({
    required this.id,
    required this.title,
    required this.isExclusive,
    this.product,
    this.values,
    this.metadata,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.products,
  });

  factory StoreProductOption.fromJson(Map<String, Object?> json) =>
      _$StoreProductOptionFromJson(json);

  /// The option's ID.
  final String id;

  /// The option's title.
  final String title;
  final dynamic product;

  /// The option's values.
  final List<StoreProductOptionValue>? values;

  /// The option's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the product option was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the product option was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The date the product option was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The products that use the option.
  final List<BaseProduct>? products;

  /// Whether the option is exclusive to a product.
  @JsonKey(name: 'is_exclusive')
  final bool isExclusive;

  Map<String, Object?> toJson() => _$StoreProductOptionToJson(this);
}
