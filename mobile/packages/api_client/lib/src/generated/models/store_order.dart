// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_order_summary.dart';
import 'base_order_transaction.dart';
import 'store_customer.dart';
import 'store_order_address.dart';
import 'store_order_fulfillment.dart';
import 'store_order_fulfillment_status.dart';
import 'store_order_line_item.dart';
import 'store_order_payment_status.dart';
import 'store_order_shipping_method.dart';
import 'store_payment_collection.dart';

part 'store_order.g.dart';

/// The order's details.
@JsonSerializable()
class StoreOrder {
  const StoreOrder({
    required this.itemSubtotal,
    required this.regionId,
    required this.customerId,
    required this.salesChannelId,
    required this.email,
    required this.currencyCode,
    required this.shippingDiscountTotal,
    required this.itemDiscountTotal,
    required this.summary,
    required this.items,
    required this.shippingMethods,
    required this.creditLineTotal,
    required this.paymentStatus,
    required this.status,
    required this.fulfillmentStatus,
    required this.id,
    required this.originalShippingTaxTotal,
    required this.createdAt,
    required this.updatedAt,
    required this.originalItemTotal,
    required this.originalItemSubtotal,
    required this.originalItemTaxTotal,
    required this.itemTotal,
    required this.discountTotal,
    required this.itemTaxTotal,
    required this.originalTotal,
    required this.originalSubtotal,
    required this.originalTaxTotal,
    required this.total,
    required this.subtotal,
    required this.taxTotal,
    required this.originalShippingTotal,
    required this.discountTaxTotal,
    required this.giftCardTotal,
    required this.giftCardTaxTotal,
    required this.shippingTotal,
    required this.shippingSubtotal,
    required this.shippingTaxTotal,
    required this.originalShippingSubtotal,
    this.billingAddress,
    this.metadata,
    this.customer,
    this.transactions,
    this.fulfillments,
    this.paymentCollections,
    this.shippingAddress,
    this.displayId,
    this.customDisplayId,
  });

  factory StoreOrder.fromJson(Map<String, Object?> json) =>
      _$StoreOrderFromJson(json);

  /// The order's ID.
  final String id;

  /// The ID of the associated region.
  @JsonKey(name: 'region_id')
  final String regionId;

  /// The ID of the customer that placed the order.
  @JsonKey(name: 'customer_id')
  final String customerId;

  /// The ID of the sales channel the order was placed in.
  @JsonKey(name: 'sales_channel_id')
  final String salesChannelId;

  /// The email of the customer that placed the order.
  final String email;

  /// The order's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The order's display ID.
  @JsonKey(name: 'display_id')
  final num? displayId;
  @JsonKey(name: 'shipping_address')
  final StoreOrderAddress? shippingAddress;
  @JsonKey(name: 'billing_address')
  final StoreOrderAddress? billingAddress;

  /// The order's items.
  final List<StoreOrderLineItem> items;

  /// The order's shipping methods.
  @JsonKey(name: 'shipping_methods')
  final List<StoreOrderShippingMethod> shippingMethods;

  /// The order's payment collections.
  @JsonKey(name: 'payment_collections')
  final List<StorePaymentCollection>? paymentCollections;

  /// The order's payment status.
  @JsonKey(name: 'payment_status')
  final StoreOrderPaymentStatus paymentStatus;

  /// The order's fulfillments.
  final List<StoreOrderFulfillment>? fulfillments;

  /// The order's fulfillment status.
  @JsonKey(name: 'fulfillment_status')
  final StoreOrderFulfillmentStatus fulfillmentStatus;
  final BaseOrderSummary summary;

  /// The order's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the order was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the order was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

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

  /// The order's total before discounts, including taxes. Calculated as the sum of `original_item_total` and `original_shipping_total`.
  @JsonKey(name: 'original_total')
  final num originalTotal;

  /// The order's subtotal before discounts, excluding taxes. Calculated as the sum of `original_item_subtotal` and `original_shipping_subtotal`.
  @JsonKey(name: 'original_subtotal')
  final num originalSubtotal;

  /// The order's tax total before discounts. Calculated as the sum of `original_item_tax_total` and `original_shipping_tax_total`.
  @JsonKey(name: 'original_tax_total')
  final num originalTaxTotal;

  /// The order's final total after discounts and credit lines, including taxes.
  final num total;

  /// The order's subtotal before discounts, excluding taxes. Calculated as the sum of `item_subtotal` and `shipping_subtotal`.
  final num subtotal;

  /// The order's tax total after discounts. Calculated as the sum of `item_tax_total` and `shipping_tax_total`.
  @JsonKey(name: 'tax_total')
  final num taxTotal;

  /// The total amount of discounts applied to the order, including the tax portion of discounts.
  @JsonKey(name: 'discount_total')
  final num discountTotal;

  /// The total amount of discounts applied to the order's tax. Represents the tax portion of discounts.
  @JsonKey(name: 'discount_tax_total')
  final num discountTaxTotal;

  /// The order's gift card total.
  @JsonKey(name: 'gift_card_total')
  final num giftCardTotal;

  /// The total taxes applied on the gift card's amount.
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
  final StoreCustomer? customer;

  /// The order's transactions.
  final List<BaseOrderTransaction>? transactions;

  /// The order's status.
  final String status;

  /// The total amount of credit lines applied to the order, including taxes. Subtracted from the final total.
  @JsonKey(name: 'credit_line_total')
  final num creditLineTotal;

  /// The sum of all discounts applied to line items, including the tax portion of discounts.
  @JsonKey(name: 'item_discount_total')
  final num itemDiscountTotal;

  /// The sum of all discounts applied to shipping methods, including the tax portion of discounts.
  @JsonKey(name: 'shipping_discount_total')
  final num shippingDiscountTotal;

  /// The custom display ID of the order.
  @JsonKey(name: 'custom_display_id')
  final String? customDisplayId;

  Map<String, Object?> toJson() => _$StoreOrderToJson(this);
}
