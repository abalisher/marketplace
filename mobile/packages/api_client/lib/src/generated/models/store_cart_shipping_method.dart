// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_cart_shipping_method_adjustments.dart';
import 'store_cart_shipping_method_tax_lines.dart';

part 'store_cart_shipping_method.g.dart';

/// A cart's shipping method.
@JsonSerializable()
class StoreCartShippingMethod {
  const StoreCartShippingMethod({
    required this.id,
    required this.cartId,
    required this.name,
    required this.amount,
    required this.isTaxInclusive,
    required this.createdAt,
    required this.updatedAt,
    this.description,
    this.shippingOptionId,
    this.data,
    this.metadata,
    this.taxLines,
    this.adjustments,
    this.originalTotal,
    this.originalSubtotal,
    this.originalTaxTotal,
    this.total,
    this.subtotal,
    this.taxTotal,
    this.discountTotal,
    this.discountTaxTotal,
  });

  factory StoreCartShippingMethod.fromJson(Map<String, Object?> json) =>
      _$StoreCartShippingMethodFromJson(json);

  /// The shipping method's ID.
  final String id;

  /// The ID of the cart this shipping method belongs to.
  @JsonKey(name: 'cart_id')
  final String cartId;

  /// The shipping method's name.
  final String name;

  /// The shipping method's description.
  final String? description;

  /// The shipping method's amount.
  final num amount;

  /// Whether the shipping method's amount is tax inclusive.
  @JsonKey(name: 'is_tax_inclusive')
  final bool isTaxInclusive;

  /// The ID of the shipping option this method was created from.
  @JsonKey(name: 'shipping_option_id')
  final String? shippingOptionId;

  /// The shipping method's data, useful for fulfillment handling by third-party services.
  final dynamic data;

  /// The shipping method's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The shipping method's tax lines.
  @JsonKey(name: 'tax_lines')
  final List<StoreCartShippingMethodTaxLines>? taxLines;

  /// The shipping method's adjustments, such as applied promotions.
  final List<StoreCartShippingMethodAdjustments>? adjustments;

  /// The date the shipping method was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the shipping method was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The shipping method's original total before discounts, including taxes. This field is only available if you expand the `shipping_methods.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-shipping-method-totals) guide.
  @JsonKey(name: 'original_total')
  final num? originalTotal;

  /// The shipping method's original subtotal before discounts, excluding taxes. This field is only available if you expand the `shipping_methods.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-shipping-method-totals) guide.
  @JsonKey(name: 'original_subtotal')
  final num? originalSubtotal;

  /// The shipping method's original tax total before discounts. This field is only available if you expand the `shipping_methods.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-shipping-method-totals) guide.
  @JsonKey(name: 'original_tax_total')
  final num? originalTaxTotal;

  /// The shipping method's total after discounts, including taxes. This field is only available if you expand the `shipping_methods.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-shipping-method-totals) guide.
  final num? total;

  /// The shipping method's subtotal before discounts, excluding taxes. This field is only available if you expand the `shipping_methods.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-shipping-method-totals) guide.
  final num? subtotal;

  /// The shipping method's tax total after discounts. This field is only available if you expand the `shipping_methods.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-shipping-method-totals) guide.
  @JsonKey(name: 'tax_total')
  final num? taxTotal;

  /// The total amount of discounts applied to the shipping method, including the tax portion of discounts. This field is only available if you expand the `shipping_methods.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-shipping-method-totals) guide.
  @JsonKey(name: 'discount_total')
  final num? discountTotal;

  /// The total amount of discounts applied to the shipping method's tax. Represents the tax portion of discounts. This field is only available if you expand the `shipping_methods.*` relation. Learn more in the [Cart Totals](https://docs.medusajs.com/resources/storefront-development/cart/totals#retrieve-and-show-shipping-method-totals) guide.
  @JsonKey(name: 'discount_tax_total')
  final num? discountTaxTotal;

  Map<String, Object?> toJson() => _$StoreCartShippingMethodToJson(this);
}
