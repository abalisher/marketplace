// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_moderate_review.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminModerateReview _$AdminModerateReviewFromJson(Map<String, dynamic> json) =>
    AdminModerateReview(
      status: AdminModerateReviewStatus.fromJson(json['status'] as String),
    );

Map<String, dynamic> _$AdminModerateReviewToJson(
  AdminModerateReview instance,
) => <String, dynamic>{
  'status': _$AdminModerateReviewStatusEnumMap[instance.status]!,
};

const _$AdminModerateReviewStatusEnumMap = {
  AdminModerateReviewStatus.published: 'published',
  AdminModerateReviewStatus.hidden: 'hidden',
  AdminModerateReviewStatus.$unknown: r'$unknown',
};
