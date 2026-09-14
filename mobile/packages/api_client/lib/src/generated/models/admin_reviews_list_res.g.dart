// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_reviews_list_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReviewsListRes _$AdminReviewsListResFromJson(Map<String, dynamic> json) =>
    AdminReviewsListRes(
      reviews: (json['reviews'] as List<dynamic>)
          .map((e) => AdminReviewRow.fromJson(e as Map<String, dynamic>))
          .toList(),
      counts: Counts.fromJson(json['counts'] as Map<String, dynamic>),
      summaries: (json['summaries'] as List<dynamic>)
          .map((e) => AdminReviewSummary.fromJson(e as Map<String, dynamic>))
          .toList(),
      count: (json['count'] as num).toInt(),
      offset: (json['offset'] as num).toInt(),
      limit: (json['limit'] as num).toInt(),
    );

Map<String, dynamic> _$AdminReviewsListResToJson(
  AdminReviewsListRes instance,
) => <String, dynamic>{
  'reviews': instance.reviews,
  'counts': instance.counts,
  'summaries': instance.summaries,
  'count': instance.count,
  'offset': instance.offset,
  'limit': instance.limit,
};
