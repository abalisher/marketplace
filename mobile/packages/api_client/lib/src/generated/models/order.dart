// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'order_address.dart';
import 'order_credit_line.dart';
import 'order_line_item.dart';
import 'order_shipping_method.dart';
import 'order_status.dart';
import 'order_transaction.dart';
import 'summary2.dart';

part 'order.g.dart';

/// The order change's order.
@JsonSerializable()
class Order {
  const Order({
    required this.createdAt,
    required this.version,
    required this.shippingDiscountTotal,
    required this.status,
    required this.itemDiscountTotal,
    required this.creditLineTotal,
    required this.displayId,
    required this.originalShippingTaxTotal,
    required this.currencyCode,
    required this.originalShippingSubtotal,
    required this.originalShippingTotal,
    required this.shippingTaxTotal,
    required this.shippingSubtotal,
    required this.shippingTotal,
    required this.giftCardTaxTotal,
    required this.giftCardTotal,
    required this.discountTotal,
    required this.id,
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
    required this.subtotal,
    required this.taxTotal,
    required this.discountSubtotal,
    required this.discountTaxTotal,
    this.locale,
    this.metadata,
    this.summary,
    this.transactions,
    this.shippingMethods,
    this.items,
    this.billingAddress,
    this.shippingAddress,
    this.email,
    this.salesChannelId,
    this.creditLines,
    this.isDraftOrder,
    this.deletedAt,
    this.customerId,
    this.regionId,
    this.orderChange,
    this.customDisplayId,
    this.canceledAt,
  });

  factory Order.fromJson(Map<String, Object?> json) => _$OrderFromJson(json);

  /// The order's ID.
  final String id;

  /// The order's version.
  final num version;
  @JsonKey(name: 'order_change')
  final dynamic orderChange;

  /// The order's status.
  final OrderStatus status;

  /// The ID of the region the order belongs to.
  @JsonKey(name: 'region_id')
  final String? regionId;

  /// The ID of the customer that placed the order.
  @JsonKey(name: 'customer_id')
  final String? customerId;

  /// The ID of the sales channel the order was placed in.
  @JsonKey(name: 'sales_channel_id')
  final String? salesChannelId;

  /// The email of the customer that placed the order.
  final String? email;

  /// The order's currency code.
  @JsonKey(name: 'currency_code')
  final String currencyCode;
  @JsonKey(name: 'shipping_address')
  final OrderAddress? shippingAddress;
  @JsonKey(name: 'billing_address')
  final OrderAddress? billingAddress;

  /// The order's items.
  final List<OrderLineItem>? items;

  /// The order's shipping methods.
  @JsonKey(name: 'shipping_methods')
  final List<OrderShippingMethod>? shippingMethods;

  /// The order's transactions.
  final List<OrderTransaction>? transactions;

  /// The order's summary.
  final Summary2? summary;

  /// The order's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the order was canceled.
  @JsonKey(name: 'canceled_at')
  final DateTime? canceledAt;

  /// The date the order was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the order was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The order items' total including taxes, excluding promotions.
  @JsonKey(name: 'original_item_total')
  final num originalItemTotal;

  /// The order items' total excluding taxes, including promotions.
  @JsonKey(name: 'original_item_subtotal')
  final num originalItemSubtotal;

  /// The taxes total for order items, excluding promotions.
  @JsonKey(name: 'original_item_tax_total')
  final num originalItemTaxTotal;

  /// The order items' total including taxes and promotions.
  @JsonKey(name: 'item_total')
  final num itemTotal;

  /// The order items' total excluding taxes, including promotions.
  @JsonKey(name: 'item_subtotal')
  final num itemSubtotal;

  /// The tax total of the order items including promotions.
  @JsonKey(name: 'item_tax_total')
  final num itemTaxTotal;

  /// The order's total including taxes, excluding promotions.
  @JsonKey(name: 'original_total')
  final num originalTotal;

  /// The order's total excluding taxes, including promotions.
  @JsonKey(name: 'original_subtotal')
  final num originalSubtotal;

  /// The tax total of the order excluding promotions.
  @JsonKey(name: 'original_tax_total')
  final num originalTaxTotal;

  /// The order's total including taxes and promotions.
  final num total;

  /// The order's subtotal excluding taxes, including promotions.
  final num subtotal;

  /// The tax total of the order including promotions.
  @JsonKey(name: 'tax_total')
  final num taxTotal;

  /// The total discount excluding taxes.
  @JsonKey(name: 'discount_subtotal')
  final num discountSubtotal;

  /// The total discount including taxes.
  @JsonKey(name: 'discount_total')
  final num discountTotal;

  /// The tax total applied on the discount.
  @JsonKey(name: 'discount_tax_total')
  final num discountTaxTotal;

  /// The order's gift card total.
  @JsonKey(name: 'gift_card_total')
  final num giftCardTotal;

  /// The order's gift card tax total.
  @JsonKey(name: 'gift_card_tax_total')
  final num giftCardTaxTotal;

  /// The order's shipping total including taxes and promotions.
  @JsonKey(name: 'shipping_total')
  final num shippingTotal;

  /// The order's shipping total excluding taxes, including promotions.
  @JsonKey(name: 'shipping_subtotal')
  final num shippingSubtotal;

  /// The total taxes of the order's shipping including taxes.
  @JsonKey(name: 'shipping_tax_total')
  final num shippingTaxTotal;

  /// The order's shipping total including taxes, excluding promotions.
  @JsonKey(name: 'original_shipping_total')
  final num originalShippingTotal;

  /// The order's shipping total excluding taxes, including promotions.
  @JsonKey(name: 'original_shipping_subtotal')
  final num originalShippingSubtotal;

  /// The total taxes of the order's shipping excluding promotions.
  @JsonKey(name: 'original_shipping_tax_total')
  final num originalShippingTaxTotal;

  /// The order's display ID.
  @JsonKey(name: 'display_id')
  final num displayId;

  /// The order's credit lines, useful to add additional payment amounts for an order.
  @JsonKey(name: 'credit_lines')
  final List<OrderCreditLine>? creditLines;

  /// Whether the order is a draft order.
  @JsonKey(name: 'is_draft_order')
  final bool? isDraftOrder;

  /// The date the order was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

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

  /// The order's locale in [BCP 47](https://gist.github.com/typpo/b2b828a35e683b9bf8db91b5404f1bd1) format.
  final String? locale;

  Map<String, Object?> toJson() => _$OrderToJson(this);
}
