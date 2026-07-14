// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_product_option.g.dart';

/// The product option's details.
@JsonSerializable()
class AdminProductOption {
  const AdminProductOption({
    required this.id,
    required this.title,
    required this.isExclusive,
    this.values,
    this.metadata,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.products,
  });

  factory AdminProductOption.fromJson(Map<String, Object?> json) =>
      _$AdminProductOptionFromJson(json);

  /// The product option's ID.
  final String id;

  /// The product option's title.
  final String title;

  /// The product option's values.
  final List<dynamic>? values;

  /// The product option's metadata, can hold custom key-value pairs.
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
  final List<dynamic>? products;

  /// Whether the option is exclusive to a product.
  @JsonKey(name: 'is_exclusive')
  final bool isExclusive;

  Map<String, Object?> toJson() => _$AdminProductOptionToJson(this);
}
