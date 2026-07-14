// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_product_variant_inventory_kit.dart';
import 'admin_create_product_variant_price.dart';

part 'admin_create_product_variant.g.dart';

/// The product variant's details.
@JsonSerializable()
class AdminCreateProductVariant {
  const AdminCreateProductVariant({
    required this.title,
    required this.prices,
    this.sku,
    this.ean,
    this.upc,
    this.barcode,
    this.hsCode,
    this.midCode,
    this.allowBackorder,
    this.manageInventory,
    this.variantRank,
    this.weight,
    this.length,
    this.height,
    this.width,
    this.originCountry,
    this.material,
    this.metadata,
    this.options,
    this.inventoryItems,
  });

  factory AdminCreateProductVariant.fromJson(Map<String, Object?> json) =>
      _$AdminCreateProductVariantFromJson(json);

  /// The variant's title.
  final String title;

  /// The variant's SKU.
  final String? sku;

  /// The variant's EAN.
  final String? ean;

  /// The variant's UPC.
  final String? upc;

  /// The variant's barcode.
  final String? barcode;

  /// The variant's HS code.
  @JsonKey(name: 'hs_code')
  final String? hsCode;

  /// The variant's MID code.
  @JsonKey(name: 'mid_code')
  final String? midCode;

  /// Whether it's allowed to order this variant when it's out of stock.
  @JsonKey(name: 'allow_backorder')
  final bool? allowBackorder;

  /// Whether Medusa manages the variant's inventory quantity. If disabled, the product variant is always considered in stock.
  @JsonKey(name: 'manage_inventory')
  final bool? manageInventory;

  /// The sorting order of the variant among other variants in the product.
  @JsonKey(name: 'variant_rank')
  final num? variantRank;

  /// The variant's weight.
  final num? weight;

  /// The variant's length.
  final num? length;

  /// The variant's height.
  final num? height;

  /// The variant's width.
  final num? width;

  /// The variant's origin country.
  @JsonKey(name: 'origin_country')
  final String? originCountry;

  /// The variant's material.
  final String? material;

  /// The variant's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  /// The variant's prices.
  final List<AdminCreateProductVariantPrice> prices;

  /// The variant's options, where the key is an option's name, and the value is the option's value.
  final dynamic options;

  /// The variant's inventory items to create.
  @JsonKey(name: 'inventory_items')
  final List<AdminCreateProductVariantInventoryKit>? inventoryItems;

  Map<String, Object?> toJson() => _$AdminCreateProductVariantToJson(this);
}
