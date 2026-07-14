// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_update_product_variant_price.dart';

part 'admin_batch_update_product_variant.g.dart';

/// The properties to update of a product variant.
@JsonSerializable()
class AdminBatchUpdateProductVariant {
  const AdminBatchUpdateProductVariant({
    required this.id,
    this.title,
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
    this.prices,
    this.options,
    this.thumbnail,
  });

  factory AdminBatchUpdateProductVariant.fromJson(Map<String, Object?> json) =>
      _$AdminBatchUpdateProductVariantFromJson(json);

  /// The product variant's title.
  final String? title;

  /// The product variant's SKU.
  final String? sku;

  /// The product variant's EAN.
  final String? ean;

  /// The product variant's UPC.
  final String? upc;

  /// The product variant's barcode.
  final String? barcode;

  /// The product variant's HS code.
  @JsonKey(name: 'hs_code')
  final String? hsCode;

  /// The product variant's MID code.
  @JsonKey(name: 'mid_code')
  final String? midCode;

  /// Whether customers can order the variant even if it's not in stock.
  @JsonKey(name: 'allow_backorder')
  final bool? allowBackorder;

  /// Whether the Medusa application manages the variant's inventory. If disabled, the product variant is always considered in stock.
  @JsonKey(name: 'manage_inventory')
  final bool? manageInventory;

  /// The product variant's rank among its siblings.
  @JsonKey(name: 'variant_rank')
  final num? variantRank;

  /// The product variant's weight.
  final num? weight;

  /// The product variant's length.
  final num? length;

  /// The product variant's height.
  final num? height;

  /// The product variant's width.
  final num? width;

  /// The product variant's origin country.
  @JsonKey(name: 'origin_country')
  final String? originCountry;

  /// The product variant's material.
  final String? material;

  /// The product variant's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The product variant's prices.
  final List<AdminUpdateProductVariantPrice>? prices;

  /// The product variant's options.
  final dynamic options;

  /// The update's ID.
  final String id;

  /// The variant's thumbnail.
  final String? thumbnail;

  Map<String, Object?> toJson() => _$AdminBatchUpdateProductVariantToJson(this);
}
