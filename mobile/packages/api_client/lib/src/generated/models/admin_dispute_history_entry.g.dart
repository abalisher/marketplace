// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_dispute_history_entry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDisputeHistoryEntry _$AdminDisputeHistoryEntryFromJson(
  Map<String, dynamic> json,
) => AdminDisputeHistoryEntry(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  category: json['category'] as String,
  status: json['status'] as String,
  orderDisplayId: (json['order_display_id'] as num?)?.toInt(),
  outcome: json['outcome'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$AdminDisputeHistoryEntryToJson(
  AdminDisputeHistoryEntry instance,
) => <String, dynamic>{
  'id': instance.id,
  'order_id': instance.orderId,
  'order_display_id': ?instance.orderDisplayId,
  'category': instance.category,
  'status': instance.status,
  'outcome': ?instance.outcome,
  'created_at': ?instance.createdAt?.toIso8601String(),
};
