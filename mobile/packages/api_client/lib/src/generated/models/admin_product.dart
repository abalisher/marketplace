// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_collection.dart';
import 'admin_product_category.dart';
import 'admin_product_image.dart';
import 'admin_product_option.dart';
import 'admin_product_status.dart';
import 'admin_product_tag.dart';
import 'admin_product_type.dart';
import 'admin_product_variant.dart';
import 'admin_sales_channel.dart';
import 'admin_shipping_profile.dart';
import 'admin_translation.dart';

part 'admin_product.g.dart';

/// The product's details.
@JsonSerializable()
class AdminProduct {
  const AdminProduct({
    required this.subtitle,
    required this.deletedAt,
    required this.externalId,
    required this.variants,
    required this.type,
    required this.id,
    required this.length,
    required this.title,
    required this.status,
    required this.options,
    required this.description,
    required this.discountable,
    required this.typeId,
    required this.createdAt,
    required this.updatedAt,
    required this.handle,
    required this.height,
    required this.isGiftcard,
    required this.thumbnail,
    required this.width,
    required this.weight,
    required this.collectionId,
    required this.originCountry,
    required this.hsCode,
    required this.midCode,
    required this.material,
    required this.images,
    this.metadata,
    this.tags,
    this.collection,
    this.salesChannels,
    this.categories,
    this.shippingProfile,
    this.translations,
  });

  factory AdminProduct.fromJson(Map<String, Object?> json) =>
      _$AdminProductFromJson(json);

  final AdminCollection? collection;

  /// The product's categories.
  final List<AdminProductCategory>? categories;

  /// The sales channels that the product is available in.
  @JsonKey(name: 'sales_channels')
  final List<AdminSalesChannel>? salesChannels;

  /// The product's variants.
  final List<AdminProductVariant> variants;
  final AdminProductType type;

  /// The product's tags.
  final List<AdminProductTag>? tags;

  /// The product's length.
  final num length;

  /// The product's title.
  final String title;

  /// The product's status.
  final AdminProductStatus status;

  /// The product's options.
  final List<AdminProductOption> options;

  /// The product's description.
  final String description;

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
  final String subtitle;

  /// Whether the product is a gift card.
  @JsonKey(name: 'is_giftcard')
  final bool isGiftcard;

  /// The product's thumbnail.
  final String thumbnail;

  /// The product's width.
  final num width;

  /// The product's weight.
  final num weight;

  /// The product's height.
  final num height;

  /// The product's origin country.
  @JsonKey(name: 'origin_country')
  final String originCountry;

  /// The product's HS code.
  @JsonKey(name: 'hs_code')
  final String hsCode;

  /// The product's MID code.
  @JsonKey(name: 'mid_code')
  final String midCode;

  /// The product's material.
  final String material;

  /// The ID of the collection that the product belongs to.
  @JsonKey(name: 'collection_id')
  final String collectionId;

  /// The ID of the product's type.
  @JsonKey(name: 'type_id')
  final String typeId;

  /// The product's images.
  final List<AdminProductImage> images;

  /// Whether discounts can be applied on the product.
  final bool discountable;

  /// The ID of a product in an external system, such as an ERP or CMS.
  @JsonKey(name: 'external_id')
  final String externalId;

  /// The date the product was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;
  @JsonKey(name: 'shipping_profile')
  final AdminShippingProfile? shippingProfile;

  /// The product's translations.
  final List<AdminTranslation>? translations;

  Map<String, Object?> toJson() => _$AdminProductToJson(this);
}
