// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_change.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderChange _$AdminOrderChangeFromJson(
  Map<String, dynamic> json,
) => AdminOrderChange(
  id: json['id'] as String,
  version: json['version'] as num,
  orderId: json['order_id'] as String,
  returnId: json['return_id'] as String,
  exchangeId: json['exchange_id'] as String,
  claimId: json['claim_id'] as String,
  order: AdminOrder.fromJson(json['order'] as Map<String, dynamic>),
  returnOrder: AdminReturn.fromJson(
    json['return_order'] as Map<String, dynamic>,
  ),
  exchange: AdminExchange.fromJson(json['exchange'] as Map<String, dynamic>),
  claim: AdminClaim.fromJson(json['claim'] as Map<String, dynamic>),
  actions: (json['actions'] as List<dynamic>)
      .map((e) => AdminOrderChangeAction.fromJson(e as Map<String, dynamic>))
      .toList(),
  status: AdminOrderChangeStatus.fromJson(json['status'] as String),
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
  createdBy: json['created_by'] as String,
  internalNote: json['internal_note'] as String,
  changeType: json['change_type'] == null
      ? null
      : AdminOrderChangeChangeType.fromJson(json['change_type'] as String),
  carryOverPromotions: json['carry_over_promotions'] as bool?,
);

Map<String, dynamic> _$AdminOrderChangeToJson(AdminOrderChange instance) =>
    <String, dynamic>{
      'id': instance.id,
      'version': instance.version,
      'change_type': _$AdminOrderChangeChangeTypeEnumMap[instance.changeType],
      'order_id': instance.orderId,
      'return_id': instance.returnId,
      'exchange_id': instance.exchangeId,
      'claim_id': instance.claimId,
      'order': instance.order,
      'return_order': instance.returnOrder,
      'exchange': instance.exchange,
      'claim': instance.claim,
      'actions': instance.actions,
      'status': _$AdminOrderChangeStatusEnumMap[instance.status]!,
      'requested_by': instance.requestedBy,
      'requested_at': instance.requestedAt.toIso8601String(),
      'confirmed_by': instance.confirmedBy,
      'confirmed_at': instance.confirmedAt.toIso8601String(),
      'declined_by': instance.declinedBy,
      'declined_reason': instance.declinedReason,
      'metadata': instance.metadata,
      'declined_at': instance.declinedAt.toIso8601String(),
      'canceled_by': instance.canceledBy,
      'canceled_at': instance.canceledAt.toIso8601String(),
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'carry_over_promotions': instance.carryOverPromotions,
      'created_by': instance.createdBy,
      'internal_note': instance.internalNote,
    };

const _$AdminOrderChangeChangeTypeEnumMap = {
  AdminOrderChangeChangeType.valueReturn: 'return',
  AdminOrderChangeChangeType.exchange: 'exchange',
  AdminOrderChangeChangeType.claim: 'claim',
  AdminOrderChangeChangeType.edit: 'edit',
  AdminOrderChangeChangeType.$unknown: r'$unknown',
};

const _$AdminOrderChangeStatusEnumMap = {
  AdminOrderChangeStatus.canceled: 'canceled',
  AdminOrderChangeStatus.requested: 'requested',
  AdminOrderChangeStatus.pending: 'pending',
  AdminOrderChangeStatus.confirmed: 'confirmed',
  AdminOrderChangeStatus.declined: 'declined',
  AdminOrderChangeStatus.$unknown: r'$unknown',
};
