// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_create_review.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCreateReview _$StoreCreateReviewFromJson(Map<String, dynamic> json) =>
    StoreCreateReview(
      target: StoreCreateReviewTarget.fromJson(json['target'] as String),
      rating: (json['rating'] as num).toInt(),
      comment: json['comment'] as String?,
    );

Map<String, dynamic> _$StoreCreateReviewToJson(StoreCreateReview instance) =>
    <String, dynamic>{
      'target': _$StoreCreateReviewTargetEnumMap[instance.target]!,
      'rating': instance.rating,
      'comment': instance.comment,
    };

const _$StoreCreateReviewTargetEnumMap = {
  StoreCreateReviewTarget.supplier: 'supplier',
  StoreCreateReviewTarget.delivery: 'delivery',
  StoreCreateReviewTarget.$unknown: r'$unknown',
};
