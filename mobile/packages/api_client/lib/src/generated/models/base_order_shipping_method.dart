// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_order_shipping_detail.dart';
import 'base_order_shipping_method_adjustment.dart';
import 'base_order_shipping_method_tax_line.dart';

part 'base_order_shipping_method.g.dart';

/// The shipping method's details.
@JsonSerializable()
class BaseOrderShippingMethod {
  const BaseOrderShippingMethod({
    required this.id,
    required this.orderId,
    required this.name,
    required this.amount,
    required this.isTaxInclusive,
    required this.shippingOptionId,
    required this.data,
    required this.metadata,
    required this.originalTotal,
    required this.originalSubtotal,
    required this.originalTaxTotal,
    required this.total,
    required this.subtotal,
    required this.taxTotal,
    required this.discountTotal,
    required this.discountTaxTotal,
    required this.createdAt,
    required this.updatedAt,
    this.description,
    this.taxLines,
    this.adjustments,
    this.detail,
  });

  factory BaseOrderShippingMethod.fromJson(Map<String, Object?> json) =>
      _$BaseOrderShippingMethodFromJson(json);

  /// The shipping method's ID.
  final String id;

  /// The ID of the order the shipping method belongs to.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The shipping method's name.
  final String name;

  /// The shipping method's description.
  final String? description;

  /// The shipping method's amount.
  final num amount;

  /// Whether the shipping method's amount includes applied taxes.
  @JsonKey(name: 'is_tax_inclusive')
  final bool isTaxInclusive;

  /// The ID of the shipping option this method was created from.
  @JsonKey(name: 'shipping_option_id')
  final String shippingOptionId;

  /// The shipping method's data, useful for fulfillment provider handling its fulfillment.
  final dynamic data;

  /// The shipping method's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The shipping method's tax lines.
  @JsonKey(name: 'tax_lines')
  final List<BaseOrderShippingMethodTaxLine>? taxLines;

  /// The shipping method's adjustments.
  final List<BaseOrderShippingMethodAdjustment>? adjustments;

  /// The shipping method's total including taxes, excluding promotions.
  @JsonKey(name: 'original_total')
  final num originalTotal;

  /// The shipping method's total excluding taxes, including promotions.
  @JsonKey(name: 'original_subtotal')
  final num originalSubtotal;

  /// The shipping method's total taxes excluding promotions.
  @JsonKey(name: 'original_tax_total')
  final num originalTaxTotal;

  /// The shipping method's total including taxes and promotions.
  final num total;

  /// The shipping method's total excluding taxes, including promotions.
  final num subtotal;

  /// The shipping method's tax total including promotions.
  @JsonKey(name: 'tax_total')
  final num taxTotal;

  /// The total discounts applied on the shipping method.
  @JsonKey(name: 'discount_total')
  final num discountTotal;

  /// The taxes applied on the discount amount.
  @JsonKey(name: 'discount_tax_total')
  final num discountTaxTotal;

  /// The date the shipping method was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the shipping method was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  final BaseOrderShippingDetail? detail;

  Map<String, Object?> toJson() => _$BaseOrderShippingMethodToJson(this);
}
