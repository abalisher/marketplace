// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_change.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderChange _$OrderChangeFromJson(Map<String, dynamic> json) => OrderChange(
  id: json['id'] as String,
  version: json['version'] as num,
  orderId: json['order_id'] as String,
  returnId: json['return_id'] as String,
  exchangeId: json['exchange_id'] as String,
  claimId: json['claim_id'] as String,
  order: json['order'],
  returnOrder: json['return_order'],
  exchange: OrderExchange.fromJson(json['exchange'] as Map<String, dynamic>),
  claim: OrderClaim.fromJson(json['claim'] as Map<String, dynamic>),
  actions: (json['actions'] as List<dynamic>)
      .map((e) => OrderChangeAction.fromJson(e as Map<String, dynamic>))
      .toList(),
  status: OrderChangeStatus.fromJson(json['status'] as String),
  requestedBy: json['requested_by'] as String,
  requestedAt: DateTime.parse(json['requested_at'] as String),
  confirmedBy: json['confirmed_by'] as String,
  confirmedAt: DateTime.parse(json['confirmed_at'] as String),
  declinedBy: json['declined_by'] as String,
  declinedReason: json['declined_reason'] as String,
  metadata: json['metadata'],
  declinedAt: DateTime.parse(json['declined_at'] as String),
  canceledBy: json['canceled_by'] as String,
  canceledAt: DateTime.parse(json['canceled_at'] as String),
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  changeType: json['change_type'] == null
      ? null
      : OrderChangeChangeType.fromJson(json['change_type'] as String),
  carryOverPromotions: json['carry_over_promotions'] as bool?,
  noNotification: json['no_notification'] as bool?,
);

Map<String, dynamic> _$OrderChangeToJson(OrderChange instance) =>
    <String, dynamic>{
      'id': instance.id,
      'version': instance.version,
      'change_type': ?_$OrderChangeChangeTypeEnumMap[instance.changeType],
      'order_id': instance.orderId,
      'return_id': instance.returnId,
      'exchange_id': instance.exchangeId,
      'claim_id': instance.claimId,
      'order': ?instance.order,
      'return_order': ?instance.returnOrder,
      'exchange': instance.exchange,
      'claim': instance.claim,
      'actions': instance.actions,
      'status': _$OrderChangeStatusEnumMap[instance.status]!,
      'requested_by': instance.requestedBy,
      'requested_at': instance.requestedAt.toIso8601String(),
      'confirmed_by': instance.confirmedBy,
      'confirmed_at': instance.confirmedAt.toIso8601String(),
      'declined_by': instance.declinedBy,
      'declined_reason': instance.declinedReason,
      'metadata': ?instance.metadata,
      'declined_at': instance.declinedAt.toIso8601String(),
      'canceled_by': instance.canceledBy,
      'canceled_at': instance.canceledAt.toIso8601String(),
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'carry_over_promotions': ?instance.carryOverPromotions,
      'no_notification': ?instance.noNotification,
    };

const _$OrderChangeChangeTypeEnumMap = {
  OrderChangeChangeType.valueReturn: 'return',
  OrderChangeChangeType.exchange: 'exchange',
  OrderChangeChangeType.claim: 'claim',
  OrderChangeChangeType.edit: 'edit',
  OrderChangeChangeType.$unknown: r'$unknown',
};

const _$OrderChangeStatusEnumMap = {
  OrderChangeStatus.canceled: 'canceled',
  OrderChangeStatus.requested: 'requested',
  OrderChangeStatus.pending: 'pending',
  OrderChangeStatus.confirmed: 'confirmed',
  OrderChangeStatus.declined: 'declined',
  OrderChangeStatus.$unknown: r'$unknown',
};
