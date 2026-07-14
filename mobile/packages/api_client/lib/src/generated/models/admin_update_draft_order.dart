// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'order_address.dart';

part 'admin_update_draft_order.g.dart';

/// The data to update in the draft order.
@JsonSerializable()
class AdminUpdateDraftOrder {
  const AdminUpdateDraftOrder({
    this.email,
    this.shippingAddress,
    this.billingAddress,
    this.metadata,
    this.customerId,
    this.salesChannelId,
    this.locale,
  });

  factory AdminUpdateDraftOrder.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateDraftOrderFromJson(json);

  /// The customer email associated with the draft order.
  final String? email;
  @JsonKey(name: 'shipping_address')
  final OrderAddress? shippingAddress;
  @JsonKey(name: 'billing_address')
  final OrderAddress? billingAddress;

  /// The draft order's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The ID of the customer associated with the draft order.
  @JsonKey(name: 'customer_id')
  final String? customerId;

  /// The ID of the sales channel associated with the draft order.
  @JsonKey(name: 'sales_channel_id')
  final String? salesChannelId;

  /// The draft order's locale.
  final String? locale;

  Map<String, Object?> toJson() => _$AdminUpdateDraftOrderToJson(this);
}
