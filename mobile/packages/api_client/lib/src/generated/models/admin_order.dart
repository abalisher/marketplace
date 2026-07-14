// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_customer.dart';
import 'admin_order_address.dart';
import 'admin_order_fulfillment.dart';
import 'admin_order_fulfillment_status.dart';
import 'admin_order_line_item.dart';
import 'admin_order_payment_status.dart';
import 'admin_order_shipping_method.dart';
import 'admin_payment_collection.dart';
import 'admin_region.dart';
import 'admin_sales_channel.dart';
import 'base_order_summary.dart';
import 'base_order_transaction.dart';
import 'order_credit_line.dart';

part 'admin_order.g.dart';

/// The order's details.
@JsonSerializable()
class AdminOrder {
  const AdminOrder({
    required this.fulfillmentStatus,
    required this.shippingDiscountTotal,
    required this.itemDiscountTotal,
    required this.creditLineTotal,
    required this.status,
    required this.originalShippingTaxTotal,
    required this.id,
    required this.version,
    required this.regionId,
    required this.customerId,
    required this.salesChannelId,
    required this.email,
    required this.currencyCode,
    required this.originalShippingSubtotal,
    required this.items,
    required this.shippingMethods,
    required this.paymentStatus,
    required this.paymentCollections,
    required this.originalShippingTotal,
    required this.summary,
    required this.shippingTaxTotal,
    required this.createdAt,
    required this.updatedAt,
    required this.originalItemTotal,
    required this.originalItemSubtotal,
    required this.originalItemTaxTotal,
    required this.itemTotal,
    required this.itemSubtotal,
    required this.itemTaxTotal,
    required this.originalTotal,
    required this.originalSubtotal,
    required this.originalTaxTotal,
    required this.total,
    required this.shippingSubtotal,
    required this.taxTotal,
    required this.discountTotal,
    required this.discountTaxTotal,
    required this.giftCardTotal,
    required this.giftCardTaxTotal,
    required this.shippingTotal,
    required this.subtotal,
    this.metadata,
    this.transactions,
    this.displayId,
    this.billingAddress,
    this.shippingAddress,
    this.region,
    this.creditLines,
    this.customer,
    this.salesChannel,
    this.fulfillments,
    this.customDisplayId,
  });

  factory AdminOrder.fromJson(Map<String, Object?> json) =>
      _$AdminOrderFromJson(json);

  /// The order's payment collections.
  @JsonKey(name: 'payment_collections')
  final List<AdminPaymentCollection> paymentCollections;

  /// The order's fulfillments.
  final List<AdminOrderFulfillment>? fulfillments;
  @JsonKey(name: 'sales_channel')
  final AdminSalesChannel? salesChannel;
  final AdminCustomer? customer;
  @JsonKey(name: 'shipping_address')
  final AdminOrderAddress? shippingAddress;
  @JsonKey(name: 'billing_address')
  final AdminOrderAddress? billingAddress;

  /// The order's ID.
  final String id;

  /// The order's version.
  final num version;

  /// The ID of the region associated with the order.
  @JsonKey(name: 'region_id')
  final String regionId;

  /// The ID of the customer that placed the order.
  @JsonKey(name: 'customer_id')
  final String customerId;

  /// The ID of the sales channel the order is placed in.
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

  /// The order's items.
  final List<AdminOrderLineItem> items;

  /// The order's shipping methods.
  @JsonKey(name: 'shipping_methods')
  final List<AdminOrderShippingMethod> shippingMethods;

  /// The order's payment status.
  @JsonKey(name: 'payment_status')
  final AdminOrderPaymentStatus paymentStatus;

  /// The order's fulfillment status.
  @JsonKey(name: 'fulfillment_status')
  final AdminOrderFulfillmentStatus fulfillmentStatus;

  /// The order's transactions.
  final List<BaseOrderTransaction>? transactions;
  final BaseOrderSummary summary;

  /// The order's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the order was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the order was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The total of the order's items including taxes, excluding promotions.
  @JsonKey(name: 'original_item_total')
  final num originalItemTotal;

  /// The total of the order's items excluding taxes, including promotions.
  @JsonKey(name: 'original_item_subtotal')
  final num originalItemSubtotal;

  /// The tax total of the order's items excluding promotions.
  @JsonKey(name: 'original_item_tax_total')
  final num originalItemTaxTotal;

  /// The total of the order's items including taxes and promotions.
  @JsonKey(name: 'item_total')
  final num itemTotal;

  /// The total of the order's items excluding taxes, including promotions.
  @JsonKey(name: 'item_subtotal')
  final num itemSubtotal;

  /// The tax total of the order's items including promotions.
  @JsonKey(name: 'item_tax_total')
  final num itemTaxTotal;

  /// The order's total excluding promotions, including taxes.
  @JsonKey(name: 'original_total')
  final num originalTotal;

  /// The order's total excluding taxes, including promotions.
  @JsonKey(name: 'original_subtotal')
  final num originalSubtotal;

  /// The order's tax total, excluding promotions.
  @JsonKey(name: 'original_tax_total')
  final num originalTaxTotal;

  /// The order's total including taxes and promotions.
  final num total;

  /// The order's total excluding taxes, including promotions.
  final num subtotal;

  /// The order's tax total including promotions.
  @JsonKey(name: 'tax_total')
  final num taxTotal;

  /// The order's discount or promotions total.
  @JsonKey(name: 'discount_total')
  final num discountTotal;

  /// The tax total of order's discount or promotion.
  @JsonKey(name: 'discount_tax_total')
  final num discountTaxTotal;

  /// The order's gift card total.
  @JsonKey(name: 'gift_card_total')
  final num giftCardTotal;

  /// The tax total of the order's gift card.
  @JsonKey(name: 'gift_card_tax_total')
  final num giftCardTaxTotal;

  /// The order's shipping total including taxes and promotions.
  @JsonKey(name: 'shipping_total')
  final num shippingTotal;

  /// The order's shipping total excluding taxes, including promotions.
  @JsonKey(name: 'shipping_subtotal')
  final num shippingSubtotal;

  /// The tax total of the order's shipping.
  @JsonKey(name: 'shipping_tax_total')
  final num shippingTaxTotal;

  /// The order's shipping total including taxes, excluding promotions.
  @JsonKey(name: 'original_shipping_total')
  final num originalShippingTotal;

  /// The order's shipping total excluding taxes, including promotions.
  @JsonKey(name: 'original_shipping_subtotal')
  final num originalShippingSubtotal;

  /// The tax total of the order's shipping excluding promotions.
  @JsonKey(name: 'original_shipping_tax_total')
  final num originalShippingTaxTotal;

  /// The order's status.
  final String status;
  final AdminRegion? region;

  /// The order's credit lines.
  @JsonKey(name: 'credit_lines')
  final List<OrderCreditLine>? creditLines;

  /// The order's credit line total.
  @JsonKey(name: 'credit_line_total')
  final num creditLineTotal;

  /// The total discount amount applied on the order's items.
  @JsonKey(name: 'item_discount_total')
  final num itemDiscountTotal;

  /// The total discount amount applied on the order's shipping.
  @JsonKey(name: 'shipping_discount_total')
  final num shippingDiscountTotal;

  /// The custom display ID of the order.
  @JsonKey(name: 'custom_display_id')
  final String? customDisplayId;

  Map<String, Object?> toJson() => _$AdminOrderToJson(this);
}
