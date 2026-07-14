// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_calculated_price_set.dart';
import 'base_product_image.dart';
import 'store_product_option_value.dart';

part 'store_product_variant.g.dart';

/// The variant's details.
@JsonSerializable()
class StoreProductVariant {
  const StoreProductVariant({
    required this.options,
    required this.length,
    required this.title,
    required this.id,
    required this.width,
    required this.weight,
    required this.height,
    required this.originCountry,
    required this.hsCode,
    required this.midCode,
    required this.material,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    required this.sku,
    required this.barcode,
    required this.ean,
    required this.upc,
    required this.allowBackorder,
    required this.manageInventory,
    required this.thumbnail,
    this.product,
    this.metadata,
    this.productId,
    this.inventoryQuantity,
    this.variantRank,
    this.calculatedPrice,
    this.images,
  });

  factory StoreProductVariant.fromJson(Map<String, Object?> json) =>
      _$StoreProductVariantFromJson(json);

  /// The variant's options.
  final List<StoreProductOptionValue> options;
  final dynamic product;

  /// The variant's length.
  final num length;

  /// The variant's title.
  final String title;

  /// The variant's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The variant's ID.
  final String id;

  /// The variant's width.
  final num width;

  /// The variant's weight.
  final num weight;

  /// The variant's height.
  final num height;

  /// The variant's origin country.
  @JsonKey(name: 'origin_country')
  final String originCountry;

  /// The variant's HS code.
  @JsonKey(name: 'hs_code')
  final String hsCode;

  /// The variant's MID code.
  @JsonKey(name: 'mid_code')
  final String midCode;

  /// The variant's material.
  final String material;

  /// The date the variant was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the variant was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the variant was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  /// The ID of the product this variant belongs to.
  @JsonKey(name: 'product_id')
  final String? productId;

  /// The variant's SKU.
  final String sku;

  /// The variant's barcode.
  final String barcode;

  /// The variant's EAN.
  final String ean;

  /// The variant's UPC.
  final String upc;

  /// Whether the variant can be ordered even if it's not in stock.
  @JsonKey(name: 'allow_backorder')
  final bool allowBackorder;

  /// Whether Medusa manages the variant's inventory. If disabled, the variant is always considered in stock.
  @JsonKey(name: 'manage_inventory')
  final bool manageInventory;

  /// The variant's inventory quantity. This property is only available if you pass `+variants.inventory_quantity` in the `fields` query parameter.
  @JsonKey(name: 'inventory_quantity')
  final num? inventoryQuantity;

  /// The variant's rank among its siblings.
  @JsonKey(name: 'variant_rank')
  final num? variantRank;
  @JsonKey(name: 'calculated_price')
  final BaseCalculatedPriceSet? calculatedPrice;

  /// The variant's thumbnail.
  final String thumbnail;

  /// The variant's images.
  final List<BaseProductImage>? images;

  Map<String, Object?> toJson() => _$StoreProductVariantToJson(this);
}
