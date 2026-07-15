// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_claim.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderClaim _$OrderClaimFromJson(Map<String, dynamic> json) => OrderClaim(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  claimItems: (json['claim_items'] as List<dynamic>)
      .map((e) => BaseClaimItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  additionalItems: (json['additional_items'] as List<dynamic>)
      .map((e) => BaseClaimItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  displayId: json['display_id'] as num,
  metadata: json['metadata'],
  type: OrderClaimType.fromJson(json['type'] as String),
  orderVersion: json['order_version'] as num,
  returnValue: json['return'],
  returnId: json['return_id'] as String?,
  noNotification: json['no_notification'] as bool?,
  refundAmount: json['refund_amount'] as num?,
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
  order: json['order'] == null ? null : Order.fromJson(json['order'] as String),
  rawRefundAmount: json['raw_refund_amount'],
  createdBy: json['created_by'] as String?,
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
  canceledAt: json['canceled_at'] == null
      ? null
      : DateTime.parse(json['canceled_at'] as String),
);

Map<String, dynamic> _$OrderClaimToJson(OrderClaim instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'claim_items': instance.claimItems,
      'additional_items': instance.additionalItems,
      'return': instance.returnValue,
      'return_id': instance.returnId,
      'no_notification': instance.noNotification,
      'refund_amount': instance.refundAmount,
      'display_id': instance.displayId,
      'shipping_methods': instance.shippingMethods,
      'transactions': instance.transactions,
      'metadata': instance.metadata,
      'created_at': instance.createdAt?.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'type': _$OrderClaimTypeEnumMap[instance.type]!,
      'order': _$OrderEnumMap[instance.order],
      'order_version': instance.orderVersion,
      'raw_refund_amount': instance.rawRefundAmount,
      'created_by': instance.createdBy,
      'deleted_at': instance.deletedAt?.toIso8601String(),
      'canceled_at': instance.canceledAt?.toIso8601String(),
    };

const _$OrderClaimTypeEnumMap = {
  OrderClaimType.replace: 'replace',
  OrderClaimType.refund: 'refund',
  OrderClaimType.$unknown: r'$unknown',
};

const _$OrderEnumMap = {
  Order.createdAt: 'created_at',
  Order.minusCreatedAt: '-created_at',
  Order.updatedAt: 'updated_at',
  Order.minusUpdatedAt: '-updated_at',
  Order.$unknown: r'$unknown',
};
