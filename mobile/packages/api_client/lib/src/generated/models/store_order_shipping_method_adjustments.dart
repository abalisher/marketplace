// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'base_order_shipping_method_adjustment.dart';

part 'store_order_shipping_method_adjustments.g.dart';

@JsonSerializable()
class StoreOrderShippingMethodAdjustments {
  const StoreOrderShippingMethodAdjustments({
    required this.shippingMethod,
    required this.shippingMethodId,
    required this.id,
    required this.amount,
    required this.orderId,
    required this.createdAt,
    required this.updatedAt,
    this.code,
    this.description,
    this.promotionId,
    this.providerId,
  });

  factory StoreOrderShippingMethodAdjustments.fromJson(
    Map<String, Object?> json,
  ) => _$StoreOrderShippingMethodAdjustmentsFromJson(json);

  @JsonKey(name: 'shipping_method')
  final dynamic shippingMethod;

  /// The ID of the shipping method this adjustment applies on.
  @JsonKey(name: 'shipping_method_id')
  final String shippingMethodId;

  /// The adjustment's ID.
  final String id;

  /// The adjustment's code.
  final String? code;

  /// The adjustment's amount.
  final num amount;

  /// The ID of the associated order.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The adjustment's description.
  final String? description;

  /// The ID of the promotion applied by this adjustment.
  @JsonKey(name: 'promotion_id')
  final String? promotionId;

  /// The adjustment's provider ID.
  @JsonKey(name: 'provider_id')
  final String? providerId;

  /// The date the adjustment was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the adjustment was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Map<String, Object?> toJson() =>
      _$StoreOrderShippingMethodAdjustmentsToJson(this);
}
