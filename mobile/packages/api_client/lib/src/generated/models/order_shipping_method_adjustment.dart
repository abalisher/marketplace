// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'order_shipping_method_adjustment.g.dart';

/// The shipping method adjustment's details.
@JsonSerializable()
class OrderShippingMethodAdjustment {
  const OrderShippingMethodAdjustment({
    required this.shippingMethod,
    required this.shippingMethodId,
    required this.id,
    required this.amount,
    required this.orderId,
    required this.createdAt,
    required this.updatedAt,
    required this.version,
    this.code,
    this.description,
    this.promotionId,
    this.providerId,
  });

  factory OrderShippingMethodAdjustment.fromJson(Map<String, Object?> json) =>
      _$OrderShippingMethodAdjustmentFromJson(json);

  @JsonKey(name: 'shipping_method')
  final dynamic shippingMethod;

  /// The ID of the shipping method this adjustment is for.
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

  /// The ID of the promotion this adjustment applies.
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

  /// The adjustment's version.
  final num version;

  Map<String, Object?> toJson() => _$OrderShippingMethodAdjustmentToJson(this);
}
