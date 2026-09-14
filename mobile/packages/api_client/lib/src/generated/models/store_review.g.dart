// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_review.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreReview _$StoreReviewFromJson(Map<String, dynamic> json) => StoreReview(
  id: json['id'] as String,
  orderId: json['order_id'] as String,
  target: StoreReviewTarget.fromJson(json['target'] as String),
  rating: (json['rating'] as num).toInt(),
  status: StoreReviewStatus.fromJson(json['status'] as String),
  comment: json['comment'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$StoreReviewToJson(StoreReview instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'target': _$StoreReviewTargetEnumMap[instance.target]!,
      'rating': instance.rating,
      'comment': ?instance.comment,
      'status': _$StoreReviewStatusEnumMap[instance.status]!,
      'created_at': ?instance.createdAt?.toIso8601String(),
    };

const _$StoreReviewTargetEnumMap = {
  StoreReviewTarget.supplier: 'supplier',
  StoreReviewTarget.delivery: 'delivery',
  StoreReviewTarget.$unknown: r'$unknown',
};

const _$StoreReviewStatusEnumMap = {
  StoreReviewStatus.published: 'published',
  StoreReviewStatus.hidden: 'hidden',
  StoreReviewStatus.$unknown: r'$unknown',
};
