// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_cart_address.dart';
import 'base_cart_shipping_method.dart';
import 'base_payment_collection.dart';
import 'base_region.dart';

part 'base_cart.g.dart';

/// The item's cart.
@JsonSerializable()
class BaseCart {
  const BaseCart({
    required this.itemTotal,
    required this.originalShippingSubtotal,
    required this.originalShippingTotal,
    required this.shippingTaxTotal,
    required this.shippingSubtotal,
    required this.shippingTotal,
    required this.currencyCode,
    required this.giftCardTotal,
    required this.discountTaxTotal,
    required this.discountTotal,
    required this.taxTotal,
    required this.subtotal,
    required this.id,
    required this.originalShippingTaxTotal,
    required this.originalTaxTotal,
    required this.originalItemTotal,
    required this.originalItemSubtotal,
    required this.originalItemTaxTotal,
    required this.total,
    required this.itemSubtotal,
    required this.itemTaxTotal,
    required this.originalTotal,
    required this.originalSubtotal,
    required this.giftCardTaxTotal,
    this.createdAt,
    this.paymentCollection,
    this.shippingMethods,
    this.items,
    this.billingAddress,
    this.shippingAddress,
    this.metadata,
    this.email,
    this.salesChannelId,
    this.customerId,
    this.regionId,
    this.region,
    this.updatedAt,
  });

  factory BaseCart.fromJson(Map<String, Object?> json) =>
      _$BaseCartFromJson(json);

  /// The cart's ID.
  final String id;
  final BaseRegion? region;

  /// The cart's region id.
  @JsonKey(name: 'region_id')
  final String? regionId;

  /// The cart's customer id.
  @JsonKey(name: 'customer_id')
  final String? customerId;

  /// The cart's sales channel id.
  @JsonKey(name: 'sales_channel_id')
  final String? salesChannelId;

  /// The cart's email.
  final String? email;

  /// The cart's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;
  @JsonKey(name: 'shipping_address')
  final BaseCartAddress? shippingAddress;
  @JsonKey(name: 'billing_address')
  final BaseCartAddress? billingAddress;

  /// The cart's items.
  final List<dynamic>? items;

  /// The cart's shipping methods.
  @JsonKey(name: 'shipping_methods')
  final List<BaseCartShippingMethod>? shippingMethods;
  @JsonKey(name: 'payment_collection')
  final BasePaymentCollection? paymentCollection;

  /// The cart's metadata.
  final dynamic metadata;

  /// The cart's created at.
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;

  /// The cart's updated at.
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

  /// The cart's gift card total.
  @JsonKey(name: 'gift_card_total')
  final num giftCardTotal;

  /// The cart's gift card tax total.
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

  Map<String, Object?> toJson() => _$BaseCartToJson(this);
}
