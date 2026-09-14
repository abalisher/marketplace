// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_return.dart';
import 'admin_return_item.dart';
import 'base_exchange_item.dart';
import 'base_order.dart';
import 'base_order_shipping_method.dart';
import 'base_order_transaction.dart';

part 'admin_exchange.g.dart';

/// The exchange's details.
@JsonSerializable()
class AdminExchange {
  const AdminExchange({
    required this.orderId,
    required this.returnItems,
    required this.additionalItems,
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.canceledAt,
    required this.deletedAt,
    this.noNotification,
    this.differenceDue,
    this.returnValue,
    this.returnId,
    this.displayId,
    this.shippingMethods,
    this.transactions,
    this.metadata,
    this.orderVersion,
    this.createdBy,
    this.order,
    this.allowBackorder,
  });

  factory AdminExchange.fromJson(Map<String, Object?> json) =>
      _$AdminExchangeFromJson(json);

  /// The ID of the order the exchange is created for.
  @JsonKey(name: 'order_id')
  final String orderId;

  /// The items returned (inbound) by the exchange.
  @JsonKey(name: 'return_items')
  final List<AdminReturnItem> returnItems;

  /// The new items (outbound) sent by the exchange.
  @JsonKey(name: 'additional_items')
  final List<BaseExchangeItem> additionalItems;

  /// Whether to send the customer notifications when the exchange is updated.
  @JsonKey(name: 'no_notification')
  final bool? noNotification;

  /// The amount to be exchanged or refunded. If the amount is negative, it must be refunded. If positive, additional payment is required from the customer.
  @JsonKey(name: 'difference_due')
  final num? differenceDue;

  /// The name has been replaced because it contains a keyword. Original name: `return`.
  @JsonKey(name: 'return')
  final AdminReturn? returnValue;

  /// The ID of the associated exchange.
  @JsonKey(name: 'return_id')
  final String? returnId;

  /// The exchange's ID.
  final String id;

  /// The exchange's display ID.
  @JsonKey(name: 'display_id')
  final String? displayId;

  /// The shipping methods used to send the new (outbound) items.
  @JsonKey(name: 'shipping_methods')
  final List<BaseOrderShippingMethod>? shippingMethods;

  /// The exchange's transactions.
  final List<BaseOrderTransaction>? transactions;

  /// The exchange's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date that the exchange was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date that the exchange was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The version of the order once the exchange is applied.
  @JsonKey(name: 'order_version')
  final String? orderVersion;

  /// The ID of the user that created the exchange.
  @JsonKey(name: 'created_by')
  final String? createdBy;

  /// The date the exchange was canceled.
  @JsonKey(name: 'canceled_at')
  final DateTime canceledAt;

  /// The date the exchange was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;
  final BaseOrder? order;

  /// Whether variants that are out-of-stock can still be added as additional or outbound items.
  @JsonKey(name: 'allow_backorder')
  final bool? allowBackorder;

  Map<String, Object?> toJson() => _$AdminExchangeToJson(this);
}
