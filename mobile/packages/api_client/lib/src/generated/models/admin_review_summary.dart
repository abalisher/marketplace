// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_review_summary_target.dart';

part 'admin_review_summary.g.dart';

@JsonSerializable()
class AdminReviewSummary {
  const AdminReviewSummary({
    required this.target,
    required this.count,
    required this.average,
  });

  factory AdminReviewSummary.fromJson(Map<String, Object?> json) =>
      _$AdminReviewSummaryFromJson(json);

  final AdminReviewSummaryTarget target;
  final int count;
  final num average;

  Map<String, Object?> toJson() => _$AdminReviewSummaryToJson(this);
}
