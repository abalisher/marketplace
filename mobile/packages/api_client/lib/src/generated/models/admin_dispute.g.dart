// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_dispute.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDispute _$AdminDisputeFromJson(Map<String, dynamic> json) => AdminDispute(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  category: AdminDisputeCategory.fromJson(json['category'] as String),
  description: json['description'] as String,
  status: AdminDisputeStatus.fromJson(json['status'] as String),
  customerId: json['customer_id'] as String?,
  resolution: json['resolution'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$AdminDisputeToJson(AdminDispute instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'customer_id': instance.customerId,
      'category': _$AdminDisputeCategoryEnumMap[instance.category]!,
      'description': instance.description,
      'status': _$AdminDisputeStatusEnumMap[instance.status]!,
      'resolution': instance.resolution,
      'created_at': instance.createdAt?.toIso8601String(),
    };

const _$AdminDisputeCategoryEnumMap = {
  AdminDisputeCategory.notDelivered: 'not_delivered',
  AdminDisputeCategory.damaged: 'damaged',
  AdminDisputeCategory.wrongItem: 'wrong_item',
  AdminDisputeCategory.quality: 'quality',
  AdminDisputeCategory.other: 'other',
  AdminDisputeCategory.$unknown: r'$unknown',
};

const _$AdminDisputeStatusEnumMap = {
  AdminDisputeStatus.open: 'open',
  AdminDisputeStatus.inReview: 'in_review',
  AdminDisputeStatus.resolved: 'resolved',
  AdminDisputeStatus.rejected: 'rejected',
  AdminDisputeStatus.$unknown: r'$unknown',
};
