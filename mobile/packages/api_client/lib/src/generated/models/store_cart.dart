// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_cart_address.dart';
import 'store_cart_line_item.dart';
import 'store_cart_promotion.dart';
import 'store_cart_shipping_method.dart';
import 'store_payment_collection.dart';
import 'store_region.dart';

part 'store_cart.g.dart';

/// The cart's details.
@JsonSerializable()
class StoreCart {
  const StoreCart({
    required this.itemSubtotal,
    required this.promotions,
    required this.originalShippingTaxTotal,
    required this.originalShippingSubtotal,
    required this.originalShippingTotal,
    required this.shippingTaxTotal,
    required this.currencyCode,
    required this.shippingTotal,
    required this.giftCardTaxTotal,
    required this.giftCardTotal,
    required this.discountTaxTotal,
    required this.discountTotal,
    required this.taxTotal,
    required this.id,
    required this.total,
    required this.originalItemTotal,
    required this.originalItemSubtotal,
    required this.originalItemTaxTotal,
    required this.itemTotal,
    required this.subtotal,
    required this.itemTaxTotal,
    required this.originalTotal,
    required this.originalSubtotal,
    required this.originalTaxTotal,
    required this.shippingSubtotal,
    this.completedAt,
    this.metadata,
    this.paymentCollection,
    this.shippingMethods,
    this.items,
    this.billingAddress,
    this.shippingAddress,
    this.createdAt,
    this.email,
    this.salesChannelId,
    this.customerId,
    this.regionId,
    this.region,
    this.updatedAt,
  });

  factory StoreCart.fromJson(Map<String, Object?> json) =>
      _$StoreCartFromJson(json);

  /// The cart's ID.
  final String id;
  final StoreRegion? region;

  /// The ID of the region the cart belongs to.
  @JsonKey(name: 'region_id')
  final String? regionId;

  /// The ID of the customer the cart belongs to.
  @JsonKey(name: 'customer_id')
  final String? customerId;

  /// The ID of the cart's sales channel. The created order is associated with the same sales channel.
  ///
  /// A product's availability in a sales channel only filters the products you retrieve. Medusa doesn't reject a variant added to the cart when its product isn't available in the cart's sales channel. Refer to the guide in the external documentation to learn how to enforce that validation.
  ///
  @JsonKey(name: 'sales_channel_id')
  final String? salesChannelId;

  /// The email of the customer the cart belongs to.
  final String? email;

  /// The cart's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;
  @JsonKey(name: 'shipping_address')
  final StoreCartAddress? shippingAddress;
  @JsonKey(name: 'billing_address')
  final StoreCartAddress? billingAddress;

  /// The cart's items.
  final List<StoreCartLineItem>? items;

  /// The cart's shipping methods.
  @JsonKey(name: 'shipping_methods')
  final List<StoreCartShippingMethod>? shippingMethods;
  @JsonKey(name: 'payment_collection')
  final StorePaymentCollection? paymentCollection;

  /// The cart's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the cart was created.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The date the cart was updated.
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  /// The sum of all line items' original totals before discounts, including taxes.
  @JsonKey(name: 'original_item_total')
  final num originalItemTotal;

  /// The sum of all line items' original subtotals before discounts, excluding taxes.
  @JsonKey(name: 'original_item_subtotal')
  final num originalItemSubtotal;

  /// The sum of all line items' original tax totals before discounts.
  @JsonKey(name: 'original_item_tax_total')
  final num originalItemTaxTotal;

  /// The sum of all line items' totals after discounts, including taxes.
  @JsonKey(name: 'item_total')
  final num itemTotal;

  /// The sum of all line items' subtotals before discounts, excluding taxes.
  @JsonKey(name: 'item_subtotal')
  final num itemSubtotal;

  /// The sum of all line items' tax totals after discounts.
  @JsonKey(name: 'item_tax_total')
  final num itemTaxTotal;

  /// The cart's total before discounts, including taxes. Calculated as the sum of `original_item_total` and `original_shipping_total`.
  @JsonKey(name: 'original_total')
  final num originalTotal;

  /// The cart's subtotal before discounts, excluding taxes. Calculated as the sum of `original_item_subtotal` and `original_shipping_subtotal`.
  @JsonKey(name: 'original_subtotal')
  final num originalSubtotal;

  /// The cart's tax total before discounts. Calculated as the sum of `original_item_tax_total` and `original_shipping_tax_total`.
  @JsonKey(name: 'original_tax_total')
  final num originalTaxTotal;

  /// The cart's final total after discounts and credit lines, including taxes.
  final num total;

  /// The cart's subtotal before discounts, excluding taxes. Calculated as the sum of `item_subtotal` and `shipping_subtotal`.
  final num subtotal;

  /// The cart's tax total after discounts. Calculated as the sum of `item_tax_total` and `shipping_tax_total`.
  @JsonKey(name: 'tax_total')
  final num taxTotal;

  /// The total amount of discounts applied to the cart, including the tax portion of discounts.
  @JsonKey(name: 'discount_total')
  final num discountTotal;

  /// The total amount of discounts applied to the cart's tax. Represents the tax portion of discounts.
  @JsonKey(name: 'discount_tax_total')
  final num discountTaxTotal;

  /// The total gift card amount applied on the cart.
  @JsonKey(name: 'gift_card_total')
  final num giftCardTotal;

  /// The total taxes applied on the gift card amount.
  @JsonKey(name: 'gift_card_tax_total')
  final num giftCardTaxTotal;

  /// The sum of all shipping methods' totals after discounts, including taxes.
  @JsonKey(name: 'shipping_total')
  final num shippingTotal;

  /// The sum of all shipping methods' subtotals before discounts, excluding taxes.
  @JsonKey(name: 'shipping_subtotal')
  final num shippingSubtotal;

  /// The sum of all shipping methods' tax totals after discounts.
  @JsonKey(name: 'shipping_tax_total')
  final num shippingTaxTotal;

  /// The sum of all shipping methods' original totals before discounts, including taxes.
  @JsonKey(name: 'original_shipping_total')
  final num originalShippingTotal;

  /// The sum of all shipping methods' original subtotals before discounts, excluding taxes.
  @JsonKey(name: 'original_shipping_subtotal')
  final num originalShippingSubtotal;

  /// The sum of all shipping methods' original tax totals before discounts.
  @JsonKey(name: 'original_shipping_tax_total')
  final num originalShippingTaxTotal;

  /// The cart's promotions.
  final List<StoreCartPromotion> promotions;

  /// The date the cart was completed.
  @JsonKey(name: 'completed_at')
  final DateTime? completedAt;

  Map<String, Object?> toJson() => _$StoreCartToJson(this);
}
