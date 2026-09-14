// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_collection.dart';
import 'store_product_image.dart';
import 'store_product_option.dart';
import 'store_product_status.dart';
import 'store_product_tag.dart';
import 'store_product_type.dart';
import 'store_product_variant.dart';

part 'store_product.g.dart';

/// The product's details.
@JsonSerializable()
class StoreProduct {
  const StoreProduct({
    required this.length,
    required this.title,
    required this.status,
    required this.options,
    required this.description,
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.variants,
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
    this.categories,
    this.type,
    this.metadata,
    this.collection,
    this.tags,
  });

  factory StoreProduct.fromJson(Map<String, Object?> json) =>
      _$StoreProductFromJson(json);

  /// The product's categories.
  final List<dynamic>? categories;
  final StoreProductType? type;

  /// The product's length.
  final num? length;

  /// The product's title.
  final String title;

  /// The product's status.
  final StoreProductStatus? status;

  /// The product's options.
  final List<StoreProductOption> options;

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

  /// The product's variants.
  final List<StoreProductVariant> variants;

  /// The product's handle.
  final String handle;

  /// The product's subtitle.
  final String? subtitle;

  /// Whether the product is a gift card.
  @JsonKey(name: 'is_giftcard')
  final bool isGiftcard;

  /// The product's thumbnail URL.
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
  final StoreCollection? collection;

  /// The ID of the collection that the product belongs to.
  @JsonKey(name: 'collection_id')
  final String? collectionId;

  /// The ID of the product's type.
  @JsonKey(name: 'type_id')
  final String? typeId;

  /// The product's tags.
  final List<StoreProductTag>? tags;

  /// The product's images.
  final List<StoreProductImage> images;

  /// Whether the product can be discounted.
  final bool discountable;

  /// The ID of the product in an external service or system.
  @JsonKey(name: 'external_id')
  final String? externalId;

  /// The date the product was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$StoreProductToJson(this);
}
