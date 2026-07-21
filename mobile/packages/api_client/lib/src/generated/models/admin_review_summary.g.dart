// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_review_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminReviewSummary _$AdminReviewSummaryFromJson(Map<String, dynamic> json) =>
    AdminReviewSummary(
      target: AdminReviewSummaryTarget.fromJson(json['target'] as String),
      count: (json['count'] as num).toInt(),
      average: json['average'] as num,
    );

Map<String, dynamic> _$AdminReviewSummaryToJson(AdminReviewSummary instance) =>
    <String, dynamic>{
      'target': _$AdminReviewSummaryTargetEnumMap[instance.target]!,
      'count': instance.count,
      'average': instance.average,
    };

const _$AdminReviewSummaryTargetEnumMap = {
  AdminReviewSummaryTarget.supplier: 'supplier',
  AdminReviewSummaryTarget.delivery: 'delivery',
  AdminReviewSummaryTarget.$unknown: r'$unknown',
};
