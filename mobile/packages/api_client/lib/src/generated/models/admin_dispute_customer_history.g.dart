// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_dispute_customer_history.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDisputeCustomerHistory _$AdminDisputeCustomerHistoryFromJson(
  Map<String, dynamic> json,
) => AdminDisputeCustomerHistory(
  orderCount: (json['order_count'] as num).toInt(),
  disputeCount: (json['dispute_count'] as num).toInt(),
  resolvedCount: (json['resolved_count'] as num).toInt(),
  rejectedCount: (json['rejected_count'] as num).toInt(),
  others: (json['others'] as List<dynamic>)
      .map((e) => AdminDisputeHistoryEntry.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminDisputeCustomerHistoryToJson(
  AdminDisputeCustomerHistory instance,
) => <String, dynamic>{
  'order_count': instance.orderCount,
  'dispute_count': instance.disputeCount,
  'resolved_count': instance.resolvedCount,
  'rejected_count': instance.rejectedCount,
  'others': instance.others,
};
