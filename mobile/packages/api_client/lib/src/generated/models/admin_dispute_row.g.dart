// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_dispute_row.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDisputeRow _$AdminDisputeRowFromJson(Map<String, dynamic> json) =>
    AdminDisputeRow(
      id: json['id'] as String,
      orderId: json['order_id'] as String,
      category: AdminDisputeCategory.fromJson(json['category'] as String),
      description: json['description'] as String?,
      status: AdminDisputeStatus.fromJson(json['status'] as String),
      ageHours: (json['age_hours'] as num).toInt(),
      overdue: json['overdue'] as bool,
      customerId: json['customer_id'] as String?,
      resolution: json['resolution'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      outcome: json['outcome'] == null
          ? null
          : AdminDisputeOutcome.fromJson(json['outcome'] as String),
      source: json['source'] == null
          ? null
          : AdminDisputeSource.fromJson(json['source'] as String),
      order: json['order'] == null
          ? null
          : AdminOrderLifecycleOrder.fromJson(
              json['order'] as Map<String, dynamic>,
            ),
    );

Map<String, dynamic> _$AdminDisputeRowToJson(AdminDisputeRow instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'customer_id': ?instance.customerId,
      'category': _$AdminDisputeCategoryEnumMap[instance.category]!,
      'description': ?instance.description,
      'status': _$AdminDisputeStatusEnumMap[instance.status]!,
      'resolution': ?instance.resolution,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'outcome': ?_$AdminDisputeOutcomeEnumMap[instance.outcome],
      'source': ?_$AdminDisputeSourceEnumMap[instance.source],
      'order': ?instance.order,
      'age_hours': instance.ageHours,
      'overdue': instance.overdue,
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

const _$AdminDisputeOutcomeEnumMap = {
  AdminDisputeOutcome.refund: 'refund',
  AdminDisputeOutcome.redelivery: 'redelivery',
  AdminDisputeOutcome.replacement: 'replacement',
  AdminDisputeOutcome.bonus: 'bonus',
  AdminDisputeOutcome.none: 'none',
  AdminDisputeOutcome.$unknown: r'$unknown',
};

const _$AdminDisputeSourceEnumMap = {
  AdminDisputeSource.buyer: 'buyer',
  AdminDisputeSource.valueOperator: 'operator',
  AdminDisputeSource.$unknown: r'$unknown',
};
