// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'return.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Return _$ReturnFromJson(Map<String, dynamic> json) => Return(
  id: json['id'] as String,
  status: ReturnStatus.fromJson(json['status'] as String),
  orderId: json['order_id'] as String,
  items: (json['items'] as List<dynamic>)
      .map((e) => OrderReturnItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  metadata: json['metadata'],
  displayId: json['display_id'] as num,
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
  canceledAt: json['canceled_at'] == null
      ? null
      : DateTime.parse(json['canceled_at'] as String),
  rawRefundAmount: json['raw_refund_amount'],
  order: json['order'] == null ? null : Order.fromJson(json['order'] as String),
  exchangeId: json['exchange_id'] as String?,
  exchange: json['exchange'],
  claimId: json['claim_id'] as String?,
  claim: json['claim'] == null
      ? null
      : OrderClaim.fromJson(json['claim'] as Map<String, dynamic>),
  locationId: json['location_id'] as String?,
  noNotification: json['no_notification'] as bool?,
  createdBy: json['created_by'] as String?,
  deletedAt: json['deleted_at'] == null
      ? null
      : DateTime.parse(json['deleted_at'] as String),
  requestedAt: json['requested_at'] == null
      ? null
      : DateTime.parse(json['requested_at'] as String),
  receivedAt: json['received_at'] == null
      ? null
      : DateTime.parse(json['received_at'] as String),
);

Map<String, dynamic> _$ReturnToJson(Return instance) => <String, dynamic>{
  'id': instance.id,
  'status': _$ReturnStatusEnumMap[instance.status]!,
  'refund_amount': instance.refundAmount,
  'order_id': instance.orderId,
  'items': instance.items,
  'shipping_methods': instance.shippingMethods,
  'transactions': instance.transactions,
  'metadata': instance.metadata,
  'created_at': instance.createdAt?.toIso8601String(),
  'updated_at': instance.updatedAt?.toIso8601String(),
  'canceled_at': instance.canceledAt?.toIso8601String(),
  'raw_refund_amount': instance.rawRefundAmount,
  'order': _$OrderEnumMap[instance.order],
  'exchange_id': instance.exchangeId,
  'exchange': instance.exchange,
  'claim_id': instance.claimId,
  'claim': instance.claim,
  'display_id': instance.displayId,
  'location_id': instance.locationId,
  'no_notification': instance.noNotification,
  'created_by': instance.createdBy,
  'deleted_at': instance.deletedAt?.toIso8601String(),
  'requested_at': instance.requestedAt?.toIso8601String(),
  'received_at': instance.receivedAt?.toIso8601String(),
};

const _$ReturnStatusEnumMap = {
  ReturnStatus.canceled: 'canceled',
  ReturnStatus.requested: 'requested',
  ReturnStatus.received: 'received',
  ReturnStatus.partiallyReceived: 'partially_received',
  ReturnStatus.$unknown: r'$unknown',
};

const _$OrderEnumMap = {
  Order.createdAt: 'created_at',
  Order.minusCreatedAt: '-created_at',
  Order.updatedAt: 'updated_at',
  Order.minusUpdatedAt: '-updated_at',
  Order.$unknown: r'$unknown',
};
