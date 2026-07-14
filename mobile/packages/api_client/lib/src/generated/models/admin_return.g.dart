// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_return.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReturn _$AdminReturnFromJson(Map<String, dynamic> json) => AdminReturn(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  items: (json['items'] as List<dynamic>)
      .map((e) => AdminReturnItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  createdAt: DateTime.parse(json['created_at'] as String),
  canceledAt: DateTime.parse(json['canceled_at'] as String),
  orderVersion: json['order_version'] as num,
  displayId: json['display_id'] as num,
  receivedAt: json['received_at'] as String,
  createdBy: json['created_by'] as String,
  requestedAt: json['requested_at'] as String,
  status: json['status'] == null
      ? null
      : AdminReturnStatus.fromJson(json['status'] as String),
  refundAmount: json['refund_amount'] as num?,
  exchangeId: json['exchange_id'] as String?,
  locationId: json['location_id'] as String?,
  claimId: json['claim_id'] as String?,
  noNotification: json['no_notification'] as bool?,
);

Map<String, dynamic> _$AdminReturnToJson(AdminReturn instance) =>
    <String, dynamic>{
      'id': instance.id,
      'status': _$AdminReturnStatusEnumMap[instance.status],
      'refund_amount': instance.refundAmount,
      'order_id': instance.orderId,
      'items': instance.items,
      'created_at': instance.createdAt.toIso8601String(),
      'canceled_at': instance.canceledAt.toIso8601String(),
      'exchange_id': instance.exchangeId,
      'location_id': instance.locationId,
      'claim_id': instance.claimId,
      'order_version': instance.orderVersion,
      'display_id': instance.displayId,
      'no_notification': instance.noNotification,
      'received_at': instance.receivedAt,
      'created_by': instance.createdBy,
      'requested_at': instance.requestedAt,
    };

const _$AdminReturnStatusEnumMap = {
  AdminReturnStatus.canceled: 'canceled',
  AdminReturnStatus.requested: 'requested',
  AdminReturnStatus.received: 'received',
  AdminReturnStatus.partiallyReceived: 'partially_received',
  AdminReturnStatus.$unknown: r'$unknown',
};
