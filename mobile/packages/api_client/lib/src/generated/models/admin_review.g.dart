// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_review.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReview _$AdminReviewFromJson(Map<String, dynamic> json) => AdminReview(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  target: AdminReviewTarget.fromJson(json['target'] as String),
  rating: (json['rating'] as num).toInt(),
  status: AdminReviewStatus.fromJson(json['status'] as String),
  customerId: json['customer_id'] as String?,
  comment: json['comment'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$AdminReviewToJson(AdminReview instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'customer_id': ?instance.customerId,
      'target': _$AdminReviewTargetEnumMap[instance.target]!,
      'rating': instance.rating,
      'comment': ?instance.comment,
      'status': _$AdminReviewStatusEnumMap[instance.status]!,
      'created_at': ?instance.createdAt?.toIso8601String(),
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
