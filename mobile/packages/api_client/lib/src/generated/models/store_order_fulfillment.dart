// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_order_fulfillment.g.dart';

/// The fulfillment's details.
@JsonSerializable()
class StoreOrderFulfillment {
  const StoreOrderFulfillment({
    required this.id,
    required this.locationId,
    required this.packedAt,
    required this.shippedAt,
    required this.deliveredAt,
    required this.canceledAt,
    required this.data,
    required this.providerId,
    required this.shippingOptionId,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    required this.requiresShipping,
    required this.createdBy,
    required this.markedShippedBy,
  });

  factory StoreOrderFulfillment.fromJson(Map<String, Object?> json) =>
      _$StoreOrderFulfillmentFromJson(json);

  /// The fulfillment's ID.
  final String id;

  /// The ID of the location the items are fulfilled from.
  @JsonKey(name: 'location_id')
  final String locationId;

  /// The date the items were packed.
  @JsonKey(name: 'packed_at')
  final DateTime packedAt;

  /// The date the items were shipped.
  @JsonKey(name: 'shipped_at')
  final DateTime shippedAt;

  /// The date the items were delivered.
  @JsonKey(name: 'delivered_at')
  final DateTime deliveredAt;

  /// The date the items were canceled.
  @JsonKey(name: 'canceled_at')
  final DateTime canceledAt;

  /// Data useful for the fulfillment provider handling it. This is taken from the associated shipping option.
  final dynamic data;

  /// The ID of the fulfillment provider used to handle the fulfillment.
  @JsonKey(name: 'provider_id')
  final String providerId;

  /// The ID of the associated shipping option.
  @JsonKey(name: 'shipping_option_id')
  final String shippingOptionId;

  /// The fulfillment's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the fulfillment was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the fulfillment was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The fulfillment's requires shipping.
  @JsonKey(name: 'requires_shipping')
  final bool requiresShipping;

  /// The ID of the user that created the fulfillment.
  @JsonKey(name: 'created_by')
  final String createdBy;

  /// The ID of the user that marked the fulfillment as shipped.
  @JsonKey(name: 'marked_shipped_by')
  final String markedShippedBy;

  Map<String, Object?> toJson() => _$StoreOrderFulfillmentToJson(this);
}
