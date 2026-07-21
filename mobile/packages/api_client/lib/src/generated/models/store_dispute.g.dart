// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_dispute.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreDispute _$StoreDisputeFromJson(Map<String, dynamic> json) => StoreDispute(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  category: StoreDisputeCategory.fromJson(json['category'] as String),
  description: json['description'] as String,
  status: StoreDisputeStatus.fromJson(json['status'] as String),
  resolution: json['resolution'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$StoreDisputeToJson(StoreDispute instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'category': _$StoreDisputeCategoryEnumMap[instance.category]!,
      'description': instance.description,
      'status': _$StoreDisputeStatusEnumMap[instance.status]!,
      'resolution': instance.resolution,
      'created_at': instance.createdAt?.toIso8601String(),
    };

const _$StoreDisputeCategoryEnumMap = {
  StoreDisputeCategory.notDelivered: 'not_delivered',
  StoreDisputeCategory.damaged: 'damaged',
  StoreDisputeCategory.wrongItem: 'wrong_item',
  StoreDisputeCategory.quality: 'quality',
  StoreDisputeCategory.other: 'other',
  StoreDisputeCategory.$unknown: r'$unknown',
};

const _$StoreDisputeStatusEnumMap = {
  StoreDisputeStatus.open: 'open',
  StoreDisputeStatus.inReview: 'in_review',
  StoreDisputeStatus.resolved: 'resolved',
  StoreDisputeStatus.rejected: 'rejected',
  StoreDisputeStatus.$unknown: r'$unknown',
};
