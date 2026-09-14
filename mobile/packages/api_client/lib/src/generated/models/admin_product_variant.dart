// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price.dart';
import 'admin_product_option_value.dart';
import 'admin_product_variant_inventory_item_link.dart';
import 'admin_translation.dart';
import 'base_calculated_price_set.dart';
import 'base_product_image.dart';

part 'admin_product_variant.g.dart';

/// The product variant's details.
@JsonSerializable()
class AdminProductVariant {
  const AdminProductVariant({
    required this.prices,
    required this.id,
    required this.title,
    required this.sku,
    required this.barcode,
    required this.ean,
    required this.upc,
    required this.allowBackorder,
    required this.manageInventory,
    required this.hsCode,
    required this.originCountry,
    required this.midCode,
    required this.material,
    required this.weight,
    required this.length,
    required this.height,
    required this.width,
    required this.options,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    required this.thumbnail,
    this.inventoryQuantity,
    this.variantRank,
    this.product,
    this.productId,
    this.calculatedPrice,
    this.metadata,
    this.inventoryItems,
    this.images,
    this.translations,
  });

  factory AdminProductVariant.fromJson(Map<String, Object?> json) =>
      _$AdminProductVariantFromJson(json);

  /// The variant's prices.
  final List<AdminPrice> prices;

  /// The variant's ID.
  final String id;

  /// The variant's title.
  final String title;

  /// The variant's SKU.
  final String? sku;

  /// The variant's barcode.
  final String? barcode;

  /// The variant's EAN code.
  final String? ean;

  /// The variant's UPC.
  final String? upc;

  /// Whether the variant can be ordered even if it's out of stock.
  @JsonKey(name: 'allow_backorder')
  final bool allowBackorder;

  /// Whether the Medusa application manages the variant's inventory quantity and availablility. If disabled, the variant is always considered in stock.
  @JsonKey(name: 'manage_inventory')
  final bool manageInventory;

  /// The variant's inventory quantity. This is only included if you pass in the `fields` query parameter a `+variants.inventory_quantity` parameter.
  @JsonKey(name: 'inventory_quantity')
  final num? inventoryQuantity;

  /// The variant's HS code.
  @JsonKey(name: 'hs_code')
  final String? hsCode;

  /// The variant's origin country.
  @JsonKey(name: 'origin_country')
  final String? originCountry;

  /// The variant's MID code.
  @JsonKey(name: 'mid_code')
  final String? midCode;

  /// The variant's material.
  final String? material;

  /// The variant's weight.
  final num? weight;

  /// The variant's length.
  final num? length;

  /// The variant's height.
  final num? height;

  /// The variant's width.
  final num? width;

  /// The variant's rank among its sibling variants.
  @JsonKey(name: 'variant_rank')
  final num? variantRank;

  /// The variant's option values.
  final List<AdminProductOptionValue> options;
  final dynamic product;

  /// The ID of the product that the variant belongs to.
  @JsonKey(name: 'product_id')
  final String? productId;
  @JsonKey(name: 'calculated_price')
  final BaseCalculatedPriceSet? calculatedPrice;

  /// The date the variant was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the variant was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the variant was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The variant's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The variant's inventory items.
  @JsonKey(name: 'inventory_items')
  final List<AdminProductVariantInventoryItemLink>? inventoryItems;

  /// The variant's images.
  final List<BaseProductImage>? images;

  /// The variant's thumbnail.
  final String? thumbnail;

  /// The variant's translations.
  final List<AdminTranslation>? translations;

  Map<String, Object?> toJson() => _$AdminProductVariantToJson(this);
}
