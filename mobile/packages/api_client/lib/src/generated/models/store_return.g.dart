// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_return.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreReturn _$StoreReturnFromJson(Map<String, dynamic> json) => StoreReturn(
  items: (json['items'] as List<dynamic>)
      .map((e) => StoreReturnItem.fromJson(e as Map<String, dynamic>))
      .toList(),
  id: json['id'] as String,
  displayId: json['display_id'] as num,
  createdAt: DateTime.parse(json['created_at'] as String),
  orderId: json['order_id'] as String,
  canceledAt: json['canceled_at'] as String,
  receivedAt: json['received_at'] as String,
  createdBy: json['created_by'] as String,
  requestedAt: json['requested_at'] as String,
  status: json['status'] == null
      ? null
      : StoreReturnStatus.fromJson(json['status'] as String),
  locationId: json['location_id'] as String?,
  exchangeId: json['exchange_id'] as String?,
  claimId: json['claim_id'] as String?,
  refundAmount: json['refund_amount'] as num?,
);

Map<String, dynamic> _$StoreReturnToJson(StoreReturn instance) =>
    <String, dynamic>{
      'items': instance.items,
      'status': ?_$StoreReturnStatusEnumMap[instance.status],
      'id': instance.id,
      'display_id': instance.displayId,
      'created_at': instance.createdAt.toIso8601String(),
      'order_id': instance.orderId,
      'location_id': ?instance.locationId,
      'canceled_at': instance.canceledAt,
      'exchange_id': ?instance.exchangeId,
      'claim_id': ?instance.claimId,
      'refund_amount': ?instance.refundAmount,
      'received_at': instance.receivedAt,
      'created_by': instance.createdBy,
      'requested_at': instance.requestedAt,
    };

const _$StoreReturnStatusEnumMap = {
  StoreReturnStatus.received: 'received',
  StoreReturnStatus.canceled: 'canceled',
  StoreReturnStatus.requested: 'requested',
  StoreReturnStatus.open: 'open',
  StoreReturnStatus.partiallyReceived: 'partially_received',
  StoreReturnStatus.$unknown: r'$unknown',
};
