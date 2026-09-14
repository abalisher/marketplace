// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_product.dart';
import 'admin_product_variant.dart';
import 'base_order_line_item_adjustment.dart';
import 'base_order_line_item_tax_line.dart';

part 'admin_order_line_item.g.dart';

/// The item's details.
@JsonSerializable()
class AdminOrderLineItem {
  const AdminOrderLineItem({
    required this.variantSku,
    required this.title,
    required this.subtitle,
    required this.thumbnail,
    required this.refundableTotalPerUnit,
    required this.variantId,
    required this.refundableTotal,
    required this.productId,
    required this.productTitle,
    required this.productDescription,
    required this.productSubtitle,
    required this.productType,
    required this.productCollection,
    required this.productHandle,
    required this.id,
    required this.variantBarcode,
    required this.variantTitle,
    required this.variantOptionValues,
    required this.requiresShipping,
    required this.isDiscountable,
    required this.isTaxInclusive,
    required this.updatedAt,
    required this.unitPrice,
    required this.quantity,
    required this.discountTaxTotal,
    required this.discountTotal,
    required this.detail,
    required this.createdAt,
    required this.productTypeId,
    required this.metadata,
    required this.originalTotal,
    required this.originalSubtotal,
    required this.originalTaxTotal,
    required this.itemTotal,
    required this.itemSubtotal,
    required this.itemTaxTotal,
    required this.taxTotal,
    required this.subtotal,
    required this.total,
    this.adjustments,
    this.taxLines,
    this.product,
    this.variant,
    this.compareAtUnitPrice,
  });

  factory AdminOrderLineItem.fromJson(Map<String, Object?> json) =>
      _$AdminOrderLineItemFromJson(json);

  /// The item's ID.
  final String id;

  /// The item's title.
  final String title;

  /// The item's subtitle.
  final String? subtitle;

  /// The URL of the item's thumbnail.
  final String? thumbnail;
  final AdminProductVariant? variant;

  /// The ID of the associated variant.
  @JsonKey(name: 'variant_id')
  final String variantId;
  final AdminProduct? product;

  /// The ID of the associated product.
  @JsonKey(name: 'product_id')
  final String productId;

  /// The item's product title.
  @JsonKey(name: 'product_title')
  final String productTitle;

  /// The item's product description.
  @JsonKey(name: 'product_description')
  final String productDescription;

  /// The item's product subtitle.
  @JsonKey(name: 'product_subtitle')
  final String productSubtitle;

  /// The item's product type.
  @JsonKey(name: 'product_type')
  final String productType;

  /// The ID of the collection the item's product belongs to.
  @JsonKey(name: 'product_collection')
  final String productCollection;

  /// The item's product handle.
  @JsonKey(name: 'product_handle')
  final String productHandle;

  /// The item's variant SKU.
  @JsonKey(name: 'variant_sku')
  final String variantSku;

  /// The item's variant barcode.
  @JsonKey(name: 'variant_barcode')
  final String variantBarcode;

  /// The item's variant title.
  @JsonKey(name: 'variant_title')
  final String variantTitle;

  /// The values of the item variant's options.
  @JsonKey(name: 'variant_option_values')
  final dynamic variantOptionValues;

  /// Whether the item requires shipping.
  @JsonKey(name: 'requires_shipping')
  final bool requiresShipping;

  /// Whether the item is discountable.
  @JsonKey(name: 'is_discountable')
  final bool isDiscountable;

  /// Whether the item is tax inclusive.
  @JsonKey(name: 'is_tax_inclusive')
  final bool isTaxInclusive;

  /// The original price of the item before a promotion or sale.
  @JsonKey(name: 'compare_at_unit_price')
  final num? compareAtUnitPrice;

  /// The item's unit price.
  @JsonKey(name: 'unit_price')
  final num unitPrice;

  /// The item's quantity.
  final num quantity;

  /// The item's tax lines.
  @JsonKey(name: 'tax_lines')
  final List<BaseOrderLineItemTaxLine>? taxLines;

  /// The item's adjustments.
  final List<BaseOrderLineItemAdjustment>? adjustments;
  final dynamic detail;

  /// The date the item was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the item was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The item's total including taxes, excluding promotions.
  @JsonKey(name: 'original_total')
  final num originalTotal;

  /// The item's total excluding taxes, including promotions.
  @JsonKey(name: 'original_subtotal')
  final num originalSubtotal;

  /// The total taxes of the item, excluding promotions.
  @JsonKey(name: 'original_tax_total')
  final num originalTaxTotal;

  /// The total taxes of the item, including promotions.
  @JsonKey(name: 'item_total')
  final num itemTotal;

  /// The item's total excluding taxes, including promotions.
  @JsonKey(name: 'item_subtotal')
  final num itemSubtotal;

  /// The total taxes of the item, including promotions.
  @JsonKey(name: 'item_tax_total')
  final num itemTaxTotal;

  /// The item's total, including taxes and promotions.
  final num total;

  /// The item's subtotal excluding taxes, including promotions.
  final num subtotal;

  /// The tax total of the item including promotions.
  @JsonKey(name: 'tax_total')
  final num taxTotal;

  /// The total discount amount of the item.
  @JsonKey(name: 'discount_total')
  final num discountTotal;

  /// The total taxes applied on the discounted amount.
  @JsonKey(name: 'discount_tax_total')
  final num discountTaxTotal;

  /// The total refundable amount of the item's total.
  @JsonKey(name: 'refundable_total')
  final num refundableTotal;

  /// The total refundable amount of the item's total for a single quantity.
  @JsonKey(name: 'refundable_total_per_unit')
  final num refundableTotalPerUnit;

  /// The ID of the associated product's type.
  @JsonKey(name: 'product_type_id')
  final String productTypeId;

  Map<String, Object?> toJson() => _$AdminOrderLineItemToJson(this);
}
