// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_collection.dart';
import 'base_product_category.dart';
import 'base_product_image.dart';
import 'base_product_option.dart';
import 'base_product_status.dart';
import 'base_product_tag.dart';
import 'base_product_type.dart';

part 'base_product.g.dart';

/// The product's details.
@JsonSerializable()
class BaseProduct {
  const BaseProduct({
    required this.variants,
    required this.length,
    required this.title,
    required this.status,
    required this.options,
    required this.description,
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.handle,
    required this.subtitle,
    required this.isGiftcard,
    required this.thumbnail,
    required this.width,
    required this.weight,
    required this.height,
    required this.originCountry,
    required this.hsCode,
    required this.midCode,
    required this.material,
    required this.collectionId,
    required this.typeId,
    required this.images,
    required this.discountable,
    required this.externalId,
    required this.deletedAt,
    this.collection,
    this.categories,
    this.type,
    this.tags,
    this.metadata,
  });

  factory BaseProduct.fromJson(Map<String, Object?> json) =>
      _$BaseProductFromJson(json);

  final BaseCollection? collection;

  /// The product's categories.
  final List<BaseProductCategory>? categories;

  /// The product's variants.
  final List<dynamic> variants;
  final BaseProductType? type;

  /// The product's tags.
  final List<BaseProductTag>? tags;

  /// The product's length.
  final num? length;

  /// The product's title.
  final String title;

  /// The product's status.
  final BaseProductStatus status;

  /// The product's options.
  final List<BaseProductOption> options;

  /// The product's description.
  final String? description;

  /// The product's ID.
  final String id;

  /// The product's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the product was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the product was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The product's unique handle.
  final String handle;

  /// The product's subtitle.
  final String? subtitle;

  /// Whether the product is a gift card.
  @JsonKey(name: 'is_giftcard')
  final bool isGiftcard;

  /// The product's thumbnail.
  final String? thumbnail;

  /// The product's width.
  final num? width;

  /// The product's weight.
  final num? weight;

  /// The product's height.
  final num? height;

  /// The product's origin country.
  @JsonKey(name: 'origin_country')
  final String? originCountry;

  /// The product's HS code.
  @JsonKey(name: 'hs_code')
  final String? hsCode;

  /// The product's MID code.
  @JsonKey(name: 'mid_code')
  final String? midCode;

  /// The product's material.
  final String? material;

  /// The ID of the collection that the product belongs to.
  @JsonKey(name: 'collection_id')
  final String? collectionId;

  /// The ID of the product's type.
  @JsonKey(name: 'type_id')
  final String? typeId;

  /// The product's images.
  final List<BaseProductImage> images;

  /// Whether discounts can be applied on the product.
  final bool discountable;

  /// The ID of a product in an external system, such as an ERP or CMS.
  @JsonKey(name: 'external_id')
  final String? externalId;

  /// The date the product was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$BaseProductToJson(this);
}
