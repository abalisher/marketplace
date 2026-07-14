// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_cart.dart';
import 'base_line_item_adjustment.dart';
import 'base_product.dart';
import 'base_product_variant.dart';

part 'base_cart_line_item.g.dart';

/// The tax line's item.
@JsonSerializable()
class BaseCartLineItem {
  const BaseCartLineItem({
    required this.cartId,
    required this.title,
    required this.quantity,
    required this.isTaxInclusive,
    required this.id,
    required this.requiresShipping,
    required this.isDiscountable,
    required this.unitPrice,
    required this.cart,
    this.variantId,
    this.productType,
    this.productCollection,
    this.productHandle,
    this.variant,
    this.subtitle,
    this.variantSku,
    this.variantBarcode,
    this.variantTitle,
    this.variantOptionValues,
    this.product,
    this.productId,
    this.productTitle,
    this.compareAtUnitPrice,
    this.thumbnail,
    this.taxLines,
    this.adjustments,
    this.productDescription,
    this.productSubtitle,
    this.discountTaxTotal,
    this.createdAt,
    this.updatedAt,
    this.deletedAt,
    this.originalTotal,
    this.originalSubtotal,
    this.originalTaxTotal,
    this.itemTotal,
    this.itemSubtotal,
    this.itemTaxTotal,
    this.total,
    this.subtotal,
    this.taxTotal,
    this.discountTotal,
    this.metadata,
  });

  factory BaseCartLineItem.fromJson(Map<String, Object?> json) =>
      _$BaseCartLineItemFromJson(json);

  /// The item's ID.
  final String id;

  /// The item's title.
  final String title;

  /// The item's subtitle.
  final String? subtitle;

  /// The item's thumbnail.
  final String? thumbnail;

  /// The item's quantity.
  final num quantity;
  final BaseProduct? product;

  /// The item's product id.
  @JsonKey(name: 'product_id')
  final String? productId;

  /// The item's product title.
  @JsonKey(name: 'product_title')
  final String? productTitle;

  /// The item's product description.
  @JsonKey(name: 'product_description')
  final String? productDescription;

  /// The item's product subtitle.
  @JsonKey(name: 'product_subtitle')
  final String? productSubtitle;

  /// The item's product type.
  @JsonKey(name: 'product_type')
  final String? productType;

  /// The item's product collection.
  @JsonKey(name: 'product_collection')
  final String? productCollection;

  /// The item's product handle.
  @JsonKey(name: 'product_handle')
  final String? productHandle;
  final BaseProductVariant? variant;

  /// The item's variant id.
  @JsonKey(name: 'variant_id')
  final String? variantId;

  /// The item's variant sku.
  @JsonKey(name: 'variant_sku')
  final String? variantSku;

  /// The item's variant barcode.
  @JsonKey(name: 'variant_barcode')
  final String? variantBarcode;

  /// The item's variant title.
  @JsonKey(name: 'variant_title')
  final String? variantTitle;

  /// The item's variant option values.
  @JsonKey(name: 'variant_option_values')
  final dynamic variantOptionValues;

  /// The item's requires shipping.
  @JsonKey(name: 'requires_shipping')
  final bool requiresShipping;

  /// The item's is discountable.
  @JsonKey(name: 'is_discountable')
  final bool isDiscountable;

  /// The item's is tax inclusive.
  @JsonKey(name: 'is_tax_inclusive')
  final bool isTaxInclusive;

  /// The item's compare at unit price.
  @JsonKey(name: 'compare_at_unit_price')
  final num? compareAtUnitPrice;

  /// The item's unit price.
  @JsonKey(name: 'unit_price')
  final num unitPrice;

  /// The item's tax lines.
  @JsonKey(name: 'tax_lines')
  final List<dynamic>? taxLines;

  /// The item's adjustments.
  final List<BaseLineItemAdjustment>? adjustments;
  final BaseCart cart;

  /// The item's cart id.
  @JsonKey(name: 'cart_id')
  final String cartId;

  /// The item's metadata.
  final dynamic metadata;

  /// The item's created at.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The item's updated at.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The item's deleted at.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The line item's original total before discounts, including taxes.
  @JsonKey(name: 'original_total')
  final num? originalTotal;

  /// The line item's original subtotal before discounts, excluding taxes.
  @JsonKey(name: 'original_subtotal')
  final num? originalSubtotal;

  /// The line item's original tax total before discounts.
  @JsonKey(name: 'original_tax_total')
  final num? originalTaxTotal;

  /// The line item's total after discounts, including taxes.
  @JsonKey(name: 'item_total')
  final num? itemTotal;

  /// The line item's subtotal before discounts, excluding taxes.
  @JsonKey(name: 'item_subtotal')
  final num? itemSubtotal;

  /// The line item's tax total after discounts.
  @JsonKey(name: 'item_tax_total')
  final num? itemTaxTotal;

  /// The line item's total after discounts, including taxes.
  final num? total;

  /// The line item's subtotal before discounts, excluding taxes.
  final num? subtotal;

  /// The line item's tax total after discounts.
  @JsonKey(name: 'tax_total')
  final num? taxTotal;

  /// The total amount of discounts applied to the line item, including the tax portion of discounts.
  @JsonKey(name: 'discount_total')
  final num? discountTotal;

  /// The total amount of discounts applied to the line item's tax. Represents the tax portion of discounts.
  @JsonKey(name: 'discount_tax_total')
  final num? discountTaxTotal;

  Map<String, Object?> toJson() => _$BaseCartLineItemToJson(this);
}
