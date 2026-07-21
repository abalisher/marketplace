// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_review_summaries_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReviewSummariesRes _$AdminReviewSummariesResFromJson(
  Map<String, dynamic> json,
) => AdminReviewSummariesRes(
  summaries: (json['summaries'] as List<dynamic>)
      .map((e) => AdminReviewSummary.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminReviewSummariesResToJson(
  AdminReviewSummariesRes instance,
) => <String, dynamic>{'summaries': instance.summaries};
