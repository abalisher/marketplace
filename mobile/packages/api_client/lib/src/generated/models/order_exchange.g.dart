// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_exchange.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderExchange _$OrderExchangeFromJson(Map<String, dynamic> json) =>
    OrderExchange(
      orderId: json['order_id'] as String,
      additionalItems: (json['additional_items'] as List<dynamic>)
          .map((e) => BaseExchangeItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      id: json['id'] as String,
      displayId: json['display_id'] as num,
      metadata: json['metadata'],
      orderVersion: json['order_version'] as num,
      noNotification: json['no_notification'] as bool?,
      differenceDue: json['difference_due'] as num?,
      returnValue: json['return'] == null
          ? null
          : Return.fromJson(json['return'] as Map<String, dynamic>),
      returnId: json['return_id'] as String?,
      shippingMethods: (json['shipping_methods'] as List<dynamic>?)
          ?.map((e) => OrderShippingMethod.fromJson(e as Map<String, dynamic>))
          .toList(),
      transactions: (json['transactions'] as List<dynamic>?)
          ?.map((e) => OrderTransaction.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      order: json['order'] == null
          ? null
          : Order.fromJson(json['order'] as String),
      rawDifferenceDue: json['raw_difference_due'],
      allowBackorder: json['allow_backorder'] as bool?,
      createdBy: json['created_by'] as String?,
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
      canceledAt: json['canceled_at'] == null
          ? null
          : DateTime.parse(json['canceled_at'] as String),
    );

Map<String, dynamic> _$OrderExchangeToJson(OrderExchange instance) =>
    <String, dynamic>{
      'order_id': instance.orderId,
      'additional_items': instance.additionalItems,
      'no_notification': ?instance.noNotification,
      'difference_due': ?instance.differenceDue,
      'return': ?instance.returnValue,
      'return_id': ?instance.returnId,
      'id': instance.id,
      'display_id': instance.displayId,
      'shipping_methods': ?instance.shippingMethods,
      'transactions': ?instance.transactions,
      'metadata': ?instance.metadata,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'updated_at': ?instance.updatedAt?.toIso8601String(),
      'order': ?_$OrderEnumMap[instance.order],
      'order_version': instance.orderVersion,
      'raw_difference_due': ?instance.rawDifferenceDue,
      'allow_backorder': ?instance.allowBackorder,
      'created_by': ?instance.createdBy,
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
      'canceled_at': ?instance.canceledAt?.toIso8601String(),
    };

const _$OrderEnumMap = {
  Order.createdAt: 'created_at',
  Order.minusCreatedAt: '-created_at',
  Order.updatedAt: 'updated_at',
  Order.minusUpdatedAt: '-updated_at',
  Order.$unknown: r'$unknown',
};
