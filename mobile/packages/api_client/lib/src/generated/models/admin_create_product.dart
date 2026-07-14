// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_product_options_sealed.dart';
import 'admin_create_product_status.dart';
import 'admin_create_product_variant.dart';
import 'categories2.dart';
import 'images2.dart';
import 'sales_channels2.dart';
import 'tags2.dart';

part 'admin_create_product.g.dart';

/// The product's details.
@JsonSerializable()
class AdminCreateProduct {
  const AdminCreateProduct({
    required this.title,
    this.subtitle,
    this.description,
    this.isGiftcard,
    this.discountable,
    this.images,
    this.thumbnail,
    this.handle,
    this.status,
    this.typeId,
    this.collectionId,
    this.categories,
    this.tags,
    this.options,
    this.variants,
    this.salesChannels,
    this.weight,
    this.length,
    this.height,
    this.width,
    this.hsCode,
    this.midCode,
    this.originCountry,
    this.material,
    this.metadata,
    this.externalId,
    this.shippingProfileId,
  });

  factory AdminCreateProduct.fromJson(Map<String, Object?> json) =>
      _$AdminCreateProductFromJson(json);

  /// The product's title.
  final String title;

  /// The product's subtitle.
  final String? subtitle;

  /// The product's description.
  final String? description;

  /// Whether the product is a gift card.
  @JsonKey(name: 'is_giftcard')
  final bool? isGiftcard;

  /// Whether the product is discountable.
  final bool? discountable;

  /// The product's images.
  final List<Images2>? images;

  /// The URL of the product's thumbnail.
  final String? thumbnail;

  /// The product's handle.
  final String? handle;

  /// The product's status.
  final AdminCreateProductStatus? status;

  /// The ID of the type the product belongs to.
  @JsonKey(name: 'type_id')
  final String? typeId;

  /// The ID of the collection the product belongs to.
  @JsonKey(name: 'collection_id')
  final String? collectionId;

  /// The categories the product belongs to.
  final List<Categories2>? categories;

  /// The product's tags.
  final List<Tags2>? tags;

  /// The product's options.
  final List<AdminCreateProductOptionsSealed>? options;

  /// The product's variants.
  final List<AdminCreateProductVariant>? variants;

  /// The sales channels the product is available in.
  @JsonKey(name: 'sales_channels')
  final List<SalesChannels2>? salesChannels;

  /// The product's weight.
  final num? weight;

  /// The product's length.
  final num? length;

  /// The product's height.
  final num? height;

  /// The product's width.
  final num? width;

  /// The product's HS code.
  @JsonKey(name: 'hs_code')
  final String? hsCode;

  /// The product's MID code.
  @JsonKey(name: 'mid_code')
  final String? midCode;

  /// The product's origin country.
  @JsonKey(name: 'origin_country')
  final String? originCountry;

  /// The product's material.
  final String? material;

  /// The product's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The ID of the product in an external or third-party system.
  @JsonKey(name: 'external_id')
  final String? externalId;

  /// The ID of the product's shipping profile.
  @JsonKey(name: 'shipping_profile_id')
  final String? shippingProfileId;

  Map<String, Object?> toJson() => _$AdminCreateProductToJson(this);
}
