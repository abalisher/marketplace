// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_fulfillment_address.dart';
import 'admin_fulfillment_item.dart';
import 'admin_fulfillment_label.dart';
import 'admin_fulfillment_provider.dart';

part 'admin_fulfillment.g.dart';

/// The fulfillment's details.
@JsonSerializable()
class AdminFulfillment {
  const AdminFulfillment({
    required this.id,
    required this.locationId,
    required this.providerId,
    required this.shippingOptionId,
    required this.provider,
    required this.deliveryAddress,
    required this.items,
    required this.labels,
    required this.packedAt,
    required this.shippedAt,
    required this.deliveredAt,
    required this.canceledAt,
    required this.data,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminFulfillment.fromJson(Map<String, Object?> json) =>
      _$AdminFulfillmentFromJson(json);

  /// The fulfillment's ID.
  final String id;

  /// The ID of the location the fulfillment's items are shipped from.
  @JsonKey(name: 'location_id')
  final String locationId;

  /// The ID of the fulfillment provider handling this fulfillment.
  @JsonKey(name: 'provider_id')
  final String providerId;

  /// The ID of the shipping option this fulfillment is created for.
  @JsonKey(name: 'shipping_option_id')
  final String shippingOptionId;
  final AdminFulfillmentProvider provider;
  @JsonKey(name: 'delivery_address')
  final AdminFulfillmentAddress deliveryAddress;

  /// The fulfillment's items.
  final List<AdminFulfillmentItem> items;

  /// The fulfillment's shipment labels.
  final List<AdminFulfillmentLabel> labels;

  /// The date the fulfillment was packed at.
  @JsonKey(name: 'packed_at')
  final String packedAt;

  /// The date the fulfillment was shipped at.
  @JsonKey(name: 'shipped_at')
  final String shippedAt;

  /// The date the fulfillment was delivered at.
  @JsonKey(name: 'delivered_at')
  final String deliveredAt;

  /// The date the fulfillment was canceled at.
  @JsonKey(name: 'canceled_at')
  final String canceledAt;

  /// The fulfillment's data, useful for the third-party provider handling the fulfillment.
  final dynamic data;

  /// The fulfillment's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the fulfillment was created at.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the fulfillment was updated at.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the fulfillment was deleted at.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$AdminFulfillmentToJson(this);
}
