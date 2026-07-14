// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'order_item.dart';
import 'order_line_item_adjustment.dart';
import 'order_line_item_tax_line.dart';

part 'order_line_item.g.dart';

/// The order line item's details.
@JsonSerializable()
class OrderLineItem {
  const OrderLineItem({
    required this.taxTotal,
    required this.title,
    required this.quantity,
    required this.id,
    required this.requiresShipping,
    required this.isDiscountable,
    required this.isTaxInclusive,
    required this.unitPrice,
    required this.originalTotal,
    required this.total,
    required this.itemTaxTotal,
    required this.itemSubtotal,
    required this.itemTotal,
    required this.originalTaxTotal,
    required this.refundableTotalPerUnit,
    required this.originalSubtotal,
    required this.refundableTotal,
    required this.discountTaxTotal,
    required this.discountTotal,
    required this.updatedAt,
    required this.isGiftcard,
    required this.subtotal,
    required this.createdAt,
    required this.detail,
    this.adjustments,
    this.taxLines,
    this.compareAtUnitPrice,
    this.metadata,
    this.lineItemMetadata,
    this.variantOptionValues,
    this.variantBarcode,
    this.variantSku,
    this.productHandle,
    this.productCollection,
    this.productType,
    this.productSubtitle,
    this.variantTitle,
    this.productTitle,
    this.productId,
    this.variantId,
    this.thumbnail,
    this.productTypeId,
    this.subtitle,
    this.productDescription,
  });

  factory OrderLineItem.fromJson(Map<String, Object?> json) =>
      _$OrderLineItemFromJson(json);

  /// The item's ID.
  final String id;

  /// The item's title.
  final String title;

  /// The item's subtitle.
  final String? subtitle;

  /// The item's thumbnail URL.
  final String? thumbnail;

  /// The ID of the associated variant.
  @JsonKey(name: 'variant_id')
  final String? variantId;

  /// The ID of the associated product.
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

  /// The ID of the associated product's type.
  @JsonKey(name: 'product_type')
  final String? productType;

  /// The ID of the associated product's collection.
  @JsonKey(name: 'product_collection')
  final String? productCollection;

  /// The item's product handle.
  @JsonKey(name: 'product_handle')
  final String? productHandle;

  /// The item's variant SKU.
  @JsonKey(name: 'variant_sku')
  final String? variantSku;

  /// The item's variant barcode.
  @JsonKey(name: 'variant_barcode')
  final String? variantBarcode;

  /// The item's variant title.
  @JsonKey(name: 'variant_title')
  final String? variantTitle;

  /// The associated variant's values for the associated product's options.
  @JsonKey(name: 'variant_option_values')
  final dynamic variantOptionValues;

  /// Whether the item requires shipping.
  @JsonKey(name: 'requires_shipping')
  final bool requiresShipping;

  /// Whether the item is discountable.
  @JsonKey(name: 'is_discountable')
  final bool isDiscountable;

  /// Whether the item's price includes taxes.
  @JsonKey(name: 'is_tax_inclusive')
  final bool isTaxInclusive;

  /// The original price of the item before a promotion or sale.
  @JsonKey(name: 'compare_at_unit_price')
  final num? compareAtUnitPrice;

  /// The item's price for a single quantity.
  @JsonKey(name: 'unit_price')
  final num unitPrice;

  /// The item's quantity.
  final num quantity;

  /// The item's tax lines.
  @JsonKey(name: 'tax_lines')
  final List<OrderLineItemTaxLine>? taxLines;

  /// The item's adjustments.
  final List<OrderLineItemAdjustment>? adjustments;
  final OrderItem detail;

  /// The date the item was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the item was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The item's total including taxes and promotions.
  @JsonKey(name: 'original_total')
  final num originalTotal;

  /// The item's total excluding taxes, including promotions.
  @JsonKey(name: 'original_subtotal')
  final num originalSubtotal;

  /// The total taxes of the item excluding promotions.
  @JsonKey(name: 'original_tax_total')
  final num originalTaxTotal;

  /// The item's total for a single quantity, including taxes and promotions.
  @JsonKey(name: 'item_total')
  final num itemTotal;

  /// The item's total for a single quantity, excluding taxes and including promotions.
  @JsonKey(name: 'item_subtotal')
  final num itemSubtotal;

  /// The total taxes of a single quantity of the item, including promotions.
  @JsonKey(name: 'item_tax_total')
  final num itemTaxTotal;

  /// The item's total including taxes and promotions.
  final num total;

  /// The item's total excluding taxes, including promotions.
  final num subtotal;

  /// The total taxes of the item, including promotions.
  @JsonKey(name: 'tax_total')
  final num taxTotal;

  /// The item's discount total.
  @JsonKey(name: 'discount_total')
  final num discountTotal;

  /// The total taxes on the discounted amount.
  @JsonKey(name: 'discount_tax_total')
  final num discountTaxTotal;

  /// The total amount of the item that can be refunded.
  @JsonKey(name: 'refundable_total')
  final num refundableTotal;

  /// The total amount that can be refunded of a single quantity of the item.
  @JsonKey(name: 'refundable_total_per_unit')
  final num refundableTotalPerUnit;

  /// The ID of the associated product's type.
  @JsonKey(name: 'product_type_id')
  final String? productTypeId;

  /// Whether the item is a gift card.
  @JsonKey(name: 'is_giftcard')
  final bool isGiftcard;

  /// Custom key-value pairs on the order's line items.
  @JsonKey(name: 'line_item_metadata')
  final dynamic lineItemMetadata;

  Map<String, Object?> toJson() => _$OrderLineItemToJson(this);
}
