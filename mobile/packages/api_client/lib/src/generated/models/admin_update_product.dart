// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_update_product_option.dart';
import 'admin_update_product_status.dart';
import 'admin_update_product_variants_sealed.dart';
import 'categories3.dart';
import 'images3.dart';
import 'sales_channels3.dart';
import 'tags3.dart';

part 'admin_update_product.g.dart';

/// The product's details.
@JsonSerializable()
class AdminUpdateProduct {
  const AdminUpdateProduct({
    this.title,
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
  });

  factory AdminUpdateProduct.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateProductFromJson(json);

  /// The product's title.
  final String? title;

  /// The product's subtitle.
  final String? subtitle;

  /// The product's description.
  final String? description;

  /// Whether the product is a gift card.
  @JsonKey(name: 'is_giftcard')
  final bool? isGiftcard;

  /// Whether discounts can be applied on the product.
  final bool? discountable;

  /// The product's images.
  final List<Images3>? images;

  /// The product's thumbnail URL.
  final String? thumbnail;

  /// The product's unique handle.
  final String? handle;

  /// The product's status.
  final AdminUpdateProductStatus? status;

  /// The ID of the product's type.
  @JsonKey(name: 'type_id')
  final String? typeId;

  /// The ID of the product's collection.
  @JsonKey(name: 'collection_id')
  final String? collectionId;

  /// The product's categories.
  final List<Categories3>? categories;

  /// The product's tags.
  final List<Tags3>? tags;

  /// The product's options.
  final List<AdminUpdateProductOption>? options;

  /// The product's variants. You can add new variants or update existing ones, passing their IDs in the object.
  final List<AdminUpdateProductVariantsSealed>? variants;

  /// The sales channels that the product is available in.
  @JsonKey(name: 'sales_channels')
  final List<SalesChannels3>? salesChannels;

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

  /// The product's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The ID of the product in an external or third-party system.
  @JsonKey(name: 'external_id')
  final String? externalId;

  Map<String, Object?> toJson() => _$AdminUpdateProductToJson(this);
}
