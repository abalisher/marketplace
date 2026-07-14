// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_cart_line_item_adjustments.dart';
import 'store_cart_line_item_tax_lines.dart';
import 'store_product.dart';
import 'store_product_variant.dart';

part 'store_cart_line_item.g.dart';

/// The item's details.
@JsonSerializable()
class StoreCartLineItem {
  const StoreCartLineItem({
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

  factory StoreCartLineItem.fromJson(Map<String, Object?> json) =>
      _$StoreCartLineItemFromJson(json);

  /// The item's ID.
  final String id;

  /// The item's title.
  final String title;

  /// The item's subtitle.
  final String? subtitle;

  /// The item's thumbnail URL.
  final String? thumbnail;

  /// The item's quantity.
  final num quantity;
  final StoreProduct? product;

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
  final StoreProductVariant? variant;

  /// The ID of the associated product variant.
  @JsonKey(name: 'variant_id')
  final String? variantId;

  /// The item's variant SKU.
  @JsonKey(name: 'variant_sku')
  final String? variantSku;

  /// The item's variant barcode.
  @JsonKey(name: 'variant_barcode')
  final String? variantBarcode;

  /// The item's variant title.
  @JsonKey(name: 'variant_title')
  final String? variantTitle;

  /// The associated variant's value for the product's options.
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

  /// The price of a single quantity of the item.
  @JsonKey(name: 'unit_price')
  final num unitPrice;

  /// The item's tax lines.
  @JsonKey(name: 'tax_lines')
  final List<StoreCartLineItemTaxLines>? taxLines;

  /// The item's adjustments.
  final List<StoreCartLineItemAdjustments>? adjustments;
  final dynamic cart;

  /// The ID of the cart that the line item belongs to.
  @JsonKey(name: 'cart_id')
  final String cartId;

  /// The item's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the item was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the item was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The date the item was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  /// The line item's original total before discounts, including taxes. This field is only available if you expand the `items.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-cart-item-totals) guide.
  @JsonKey(name: 'original_total')
  final num? originalTotal;

  /// The line item's original subtotal before discounts, excluding taxes. This field is only available if you expand the `items.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-cart-item-totals) guide.
  @JsonKey(name: 'original_subtotal')
  final num? originalSubtotal;

  /// The line item's original tax total before discounts. This field is only available if you expand the `items.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-cart-item-totals) guide.
  @JsonKey(name: 'original_tax_total')
  final num? originalTaxTotal;

  /// The line item's total after discounts, including taxes. This field is only available if you expand the `items.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-cart-item-totals) guide.
  @JsonKey(name: 'item_total')
  final num? itemTotal;

  /// The line item's subtotal before discounts, excluding taxes. This field is only available if you expand the `items.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-cart-item-totals) guide.
  @JsonKey(name: 'item_subtotal')
  final num? itemSubtotal;

  /// The line item's tax total after discounts. This field is only available if you expand the `items.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-cart-item-totals) guide.
  @JsonKey(name: 'item_tax_total')
  final num? itemTaxTotal;

  /// The line item's total after discounts, including taxes. This field is only available if you expand the `items.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-cart-item-totals) guide.
  final num? total;

  /// The line item's subtotal before discounts, excluding taxes. This field is only available if you expand the `items.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-cart-item-totals) guide.
  final num? subtotal;

  /// The line item's tax total after discounts. This field is only available if you expand the `items.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-cart-item-totals) guide.
  @JsonKey(name: 'tax_total')
  final num? taxTotal;

  /// The total amount of discounts applied to the line item, including the tax portion of discounts. This field is only available if you expand the `items.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-cart-item-totals) guide.
  @JsonKey(name: 'discount_total')
  final num? discountTotal;

  /// The total amount of discounts applied to the line item's tax. Represents the tax portion of discounts. This field is only available if you expand the `items.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-cart-item-totals) guide.
  @JsonKey(name: 'discount_tax_total')
  final num? discountTaxTotal;

  Map<String, Object?> toJson() => _$StoreCartLineItemToJson(this);
}
