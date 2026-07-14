// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_order_line_item_adjustments.dart';
import 'store_order_line_item_detail.dart';
import 'store_order_line_item_tax_lines.dart';
import 'store_product.dart';
import 'store_product_variant.dart';

part 'store_order_line_item.g.dart';

/// The item's details.
@JsonSerializable()
class StoreOrderLineItem {
  const StoreOrderLineItem({
    required this.itemSubtotal,
    required this.quantity,
    required this.unitPrice,
    required this.isTaxInclusive,
    required this.detail,
    required this.title,
    required this.id,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    required this.originalTotal,
    required this.originalSubtotal,
    required this.originalTaxTotal,
    required this.itemTotal,
    required this.isDiscountable,
    required this.itemTaxTotal,
    required this.total,
    required this.subtotal,
    required this.taxTotal,
    required this.discountTotal,
    required this.discountTaxTotal,
    required this.refundableTotal,
    required this.refundableTotalPerUnit,
    required this.subtitle,
    required this.thumbnail,
    required this.variantId,
    required this.productId,
    required this.productTitle,
    required this.productTypeId,
    required this.productSubtitle,
    required this.productType,
    required this.productCollection,
    required this.productHandle,
    required this.variantSku,
    required this.variantBarcode,
    required this.variantTitle,
    required this.variantOptionValues,
    required this.requiresShipping,
    required this.productDescription,
    this.adjustments,
    this.compareAtUnitPrice,
    this.taxLines,
    this.product,
    this.variant,
  });

  factory StoreOrderLineItem.fromJson(Map<String, Object?> json) =>
      _$StoreOrderLineItemFromJson(json);

  final StoreProductVariant? variant;
  final StoreProduct? product;

  /// The item's tax lines.
  @JsonKey(name: 'tax_lines')
  final List<StoreOrderLineItemTaxLines>? taxLines;

  /// The item's adjustments.
  final List<StoreOrderLineItemAdjustments>? adjustments;
  final StoreOrderLineItemDetail detail;

  /// The item's title.
  final String title;

  /// The item's ID.
  final String id;

  /// Custom key-value pairs of the item.
  final dynamic metadata;

  /// The date the item was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the item was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

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

  /// The item's subtitle.
  final String subtitle;

  /// The item's thumbnail.
  final String thumbnail;

  /// The ID of the associated variant.
  @JsonKey(name: 'variant_id')
  final String variantId;

  /// The ID of the associated product.
  @JsonKey(name: 'product_id')
  final String productId;

  /// The title of the associated product.
  @JsonKey(name: 'product_title')
  final String productTitle;

  /// The description of the associated product.
  @JsonKey(name: 'product_description')
  final String productDescription;

  /// The subtitle of the associated product.
  @JsonKey(name: 'product_subtitle')
  final String productSubtitle;

  /// The type of the associated product.
  @JsonKey(name: 'product_type')
  final String productType;

  /// The ID of the associated product's collection.
  @JsonKey(name: 'product_collection')
  final String productCollection;

  /// The handle of the associated product.
  @JsonKey(name: 'product_handle')
  final String productHandle;

  /// The SKU of the associated variant.
  @JsonKey(name: 'variant_sku')
  final String variantSku;

  /// The barcode of the associated variant.
  @JsonKey(name: 'variant_barcode')
  final String variantBarcode;

  /// The title of the associated variant.
  @JsonKey(name: 'variant_title')
  final String variantTitle;

  /// The option values of the associated variant, where the key is the option name and the value is the option value.
  @JsonKey(name: 'variant_option_values')
  final dynamic variantOptionValues;

  /// Whether the associated variant requires shipping.
  @JsonKey(name: 'requires_shipping')
  final bool requiresShipping;

  /// Whether the associated variant is discountable.
  @JsonKey(name: 'is_discountable')
  final bool isDiscountable;

  /// Whether the associated variant's price includes taxes.
  @JsonKey(name: 'is_tax_inclusive')
  final bool isTaxInclusive;

  /// The item's compare at unit price.
  @JsonKey(name: 'compare_at_unit_price')
  final num? compareAtUnitPrice;

  /// The price of a single quantity of the item.
  @JsonKey(name: 'unit_price')
  final num unitPrice;

  /// The item's quantity.
  final num quantity;

  /// The ID of the associated product's type.
  @JsonKey(name: 'product_type_id')
  final String productTypeId;

  Map<String, Object?> toJson() => _$StoreOrderLineItemToJson(this);
}
