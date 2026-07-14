// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'order_address.dart';

part 'admin_update_order.g.dart';

/// The details to update in the order.
@JsonSerializable()
class AdminUpdateOrder {
  const AdminUpdateOrder({
    this.email,
    this.shippingAddress,
    this.billingAddress,
    this.metadata,
    this.locale,
  });

  factory AdminUpdateOrder.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateOrderFromJson(json);

  /// The order's email.
  final String? email;
  @JsonKey(name: 'shipping_address')
  final OrderAddress? shippingAddress;
  @JsonKey(name: 'billing_address')
  final OrderAddress? billingAddress;

  /// The order's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The order's locale in [BCP 47](https://gist.github.com/typpo/b2b828a35e683b9bf8db91b5404f1bd1) format.
  final String? locale;

  Map<String, Object?> toJson() => _$AdminUpdateOrderToJson(this);
}
