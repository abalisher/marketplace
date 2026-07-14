// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_create_fulfillment_item.dart';
import 'admin_create_fulfillment_label.dart';
import 'admin_fulfillment_delivery_address.dart';

part 'admin_create_fulfillment.g.dart';

/// The filfillment's details.
@JsonSerializable()
class AdminCreateFulfillment {
  const AdminCreateFulfillment({
    required this.locationId,
    required this.providerId,
    required this.deliveryAddress,
    required this.items,
    required this.labels,
    required this.orderId,
    this.shippingOptionId,
    this.data,
    this.packedAt,
    this.shippedAt,
    this.deliveredAt,
    this.canceledAt,
    this.metadata,
  });

  factory AdminCreateFulfillment.fromJson(Map<String, Object?> json) =>
      _$AdminCreateFulfillmentFromJson(json);

  /// The ID of the location the items are fulfilled from.
  @JsonKey(name: 'location_id')
  final String locationId;

  /// The ID of the provider handling this fulfillment.
  @JsonKey(name: 'provider_id')
  final String providerId;
  @JsonKey(name: 'delivery_address')
  final AdminFulfillmentDeliveryAddress deliveryAddress;

  /// The items to fulfill.
  final List<AdminCreateFulfillmentItem> items;

  /// The labels for the fulfillment's shipments.
  final List<AdminCreateFulfillmentLabel> labels;

  /// The ID of the order this fulfillment is created for.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The ID of the shipping option used in the order.
  @JsonKey(name: 'shipping_option_id')
  final String? shippingOptionId;

  /// Any data useful for the fulfillment provider to handle the fulfillment.
  final dynamic data;

  /// The date and time the fulfillment was packed.
  @JsonKey(name: 'packed_at')
  final DateTime? packedAt;

  /// The date and time the fulfillment was shipped.
  @JsonKey(name: 'shipped_at')
  final DateTime? shippedAt;

  /// The date and time the fulfillment was delivered.
  @JsonKey(name: 'delivered_at')
  final DateTime? deliveredAt;

  /// The date and time the fulfillment was canceled.
  @JsonKey(name: 'canceled_at')
  final DateTime? canceledAt;

  /// The fulfillment's metadata, used to store custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminCreateFulfillmentToJson(this);
}
