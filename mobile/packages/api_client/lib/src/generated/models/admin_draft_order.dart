// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_customer.dart';
import 'admin_draft_order_fulfillment_status.dart';
import 'admin_draft_order_payment_status.dart';
import 'admin_order_address.dart';
import 'admin_order_fulfillment.dart';
import 'admin_order_line_item.dart';
import 'admin_order_shipping_method.dart';
import 'admin_payment_collection.dart';
import 'admin_region.dart';
import 'admin_sales_channel.dart';
import 'base_order_summary.dart';
import 'base_order_transaction.dart';
import 'order_credit_line.dart';

part 'admin_draft_order.g.dart';

/// The draft order's details.
@JsonSerializable()
class AdminDraftOrder {
  const AdminDraftOrder({
    required this.paymentStatus,
    required this.shippingDiscountTotal,
    required this.itemDiscountTotal,
    required this.creditLineTotal,
    required this.originalShippingTaxTotal,
    required this.originalShippingSubtotal,
    required this.items,
    required this.shippingMethods,
    required this.status,
    required this.currencyCode,
    required this.id,
    required this.version,
    required this.regionId,
    required this.customerId,
    required this.salesChannelId,
    required this.email,
    required this.originalShippingTotal,
    required this.paymentCollections,
    required this.fulfillmentStatus,
    required this.shippingTaxTotal,
    required this.summary,
    required this.shippingSubtotal,
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
    required this.shippingTotal,
    required this.subtotal,
    required this.taxTotal,
    required this.discountTotal,
    required this.discountTaxTotal,
    required this.giftCardTotal,
    required this.giftCardTaxTotal,
    required this.total,
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

  factory AdminDraftOrder.fromJson(Map<String, Object?> json) =>
      _$AdminDraftOrderFromJson(json);

  /// The draft order's payment collections.
  @JsonKey(name: 'payment_collections')
  final List<AdminPaymentCollection> paymentCollections;

  /// The draft order's fulfillments.
  final List<AdminOrderFulfillment>? fulfillments;
  @JsonKey(name: 'sales_channel')
  final AdminSalesChannel? salesChannel;
  final AdminCustomer? customer;
  @JsonKey(name: 'shipping_address')
  final AdminOrderAddress? shippingAddress;
  @JsonKey(name: 'billing_address')
  final AdminOrderAddress? billingAddress;

  /// The draft order's items.
  final List<AdminOrderLineItem> items;

  /// The draft order's shipping methods.
  @JsonKey(name: 'shipping_methods')
  final List<AdminOrderShippingMethod> shippingMethods;

  /// The draft order's status.
  final String status;

  /// The draft order's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// The draft order's ID.
  final String id;

  /// The draft order's version.
  final num version;

  /// The ID of the region associated with the draft order.
  @JsonKey(name: 'region_id')
  final String regionId;

  /// The ID of the customer that the draft order belongs to.
  @JsonKey(name: 'customer_id')
  final String customerId;

  /// The ID of the sales channel that the draft order is placed in.
  @JsonKey(name: 'sales_channel_id')
  final String salesChannelId;

  /// The customer email associated with the draft order.
  final String email;

  /// The draft order's display ID.
  @JsonKey(name: 'display_id')
  final num? displayId;

  /// The draft order's payment status.
  @JsonKey(name: 'payment_status')
  final AdminDraftOrderPaymentStatus paymentStatus;

  /// The draft order's fulfillment status.
  @JsonKey(name: 'fulfillment_status')
  final AdminDraftOrderFulfillmentStatus fulfillmentStatus;

  /// The draft order's transactions.
  final List<BaseOrderTransaction>? transactions;
  final BaseOrderSummary summary;

  /// The draft order's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the draft order was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the draft order was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The total of the draft order's items including taxes, excluding promotions.
  @JsonKey(name: 'original_item_total')
  final num originalItemTotal;

  /// The total of the draft order's items excluding taxes, including promotions.
  @JsonKey(name: 'original_item_subtotal')
  final num originalItemSubtotal;

  /// The tax total of the draft order's items excluding promotions.
  @JsonKey(name: 'original_item_tax_total')
  final num originalItemTaxTotal;

  /// The total of the draft order's items including taxes and promotions.
  @JsonKey(name: 'item_total')
  final num itemTotal;

  /// The total of the draft order's items excluding taxes, including promotions.
  @JsonKey(name: 'item_subtotal')
  final num itemSubtotal;

  /// The tax total of the draft order's items including promotions.
  @JsonKey(name: 'item_tax_total')
  final num itemTaxTotal;

  /// The draft order's total excluding promotions, including taxes.
  @JsonKey(name: 'original_total')
  final num originalTotal;

  /// The draft order's total excluding taxes, including promotions.
  @JsonKey(name: 'original_subtotal')
  final num originalSubtotal;

  /// The draft order's tax total, excluding promotions.
  @JsonKey(name: 'original_tax_total')
  final num originalTaxTotal;

  /// The draft order's total including taxes and promotions.
  final num total;

  /// The draft order's total excluding taxes, including promotions.
  final num subtotal;

  /// The draft order's tax total including promotions.
  @JsonKey(name: 'tax_total')
  final num taxTotal;

  /// The draft order's discount or promotions total.
  @JsonKey(name: 'discount_total')
  final num discountTotal;

  /// The tax total of draft order's discount or promotion.
  @JsonKey(name: 'discount_tax_total')
  final num discountTaxTotal;

  /// The draft order's gift card total.
  @JsonKey(name: 'gift_card_total')
  final num giftCardTotal;

  /// The tax total of the draft order's gift card.
  @JsonKey(name: 'gift_card_tax_total')
  final num giftCardTaxTotal;

  /// The draft order's shipping total including taxes and promotions.
  @JsonKey(name: 'shipping_total')
  final num shippingTotal;

  /// The draft order's shipping total excluding taxes, including promotions.
  @JsonKey(name: 'shipping_subtotal')
  final num shippingSubtotal;

  /// The tax total of the draft order's shipping.
  @JsonKey(name: 'shipping_tax_total')
  final num shippingTaxTotal;

  /// The draft order's shipping total including taxes, excluding promotions.
  @JsonKey(name: 'original_shipping_total')
  final num originalShippingTotal;

  /// The draft order's shipping total excluding taxes, including promotions.
  @JsonKey(name: 'original_shipping_subtotal')
  final num originalShippingSubtotal;

  /// The tax total of the draft order's shipping excluding promotions.
  @JsonKey(name: 'original_shipping_tax_total')
  final num originalShippingTaxTotal;
  final AdminRegion? region;

  /// The draft order's credit lines.
  @JsonKey(name: 'credit_lines')
  final List<OrderCreditLine>? creditLines;

  /// The draft order's credit line total.
  @JsonKey(name: 'credit_line_total')
  final num creditLineTotal;

  /// The total discount amount applied on the draft order's items.
  @JsonKey(name: 'item_discount_total')
  final num itemDiscountTotal;

  /// The total discount amount applied on the draft order's shipping.
  @JsonKey(name: 'shipping_discount_total')
  final num shippingDiscountTotal;

  /// The custom display ID of the draft order.
  @JsonKey(name: 'custom_display_id')
  final String? customDisplayId;

  Map<String, Object?> toJson() => _$AdminDraftOrderToJson(this);
}
