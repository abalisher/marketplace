// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_review_row.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReviewRow _$AdminReviewRowFromJson(Map<String, dynamic> json) =>
    AdminReviewRow(
      id: json['id'] as String,
      orderId: json['order_id'] as String,
      target: AdminReviewTarget.fromJson(json['target'] as String),
      rating: (json['rating'] as num).toInt(),
      status: AdminReviewStatus.fromJson(json['status'] as String),
      order: json['order'] == null
          ? null
          : AdminOrderLifecycleOrder.fromJson(
              json['order'] as Map<String, dynamic>,
            ),
      customerId: json['customer_id'] as String?,
      comment: json['comment'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$AdminReviewRowToJson(AdminReviewRow instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'customer_id': ?instance.customerId,
      'target': _$AdminReviewTargetEnumMap[instance.target]!,
      'rating': instance.rating,
      'comment': ?instance.comment,
      'status': _$AdminReviewStatusEnumMap[instance.status]!,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'order': ?instance.order,
    };

const _$AdminReviewTargetEnumMap = {
  AdminReviewTarget.supplier: 'supplier',
  AdminReviewTarget.delivery: 'delivery',
  AdminReviewTarget.$unknown: r'$unknown',
};

const _$AdminReviewStatusEnumMap = {
  AdminReviewStatus.published: 'published',
  AdminReviewStatus.hidden: 'hidden',
  AdminReviewStatus.$unknown: r'$unknown',
};
