// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_review_summary.dart';

part 'admin_review_summaries_res.g.dart';

@JsonSerializable()
class AdminReviewSummariesRes {
  const AdminReviewSummariesRes({required this.summaries});

  factory AdminReviewSummariesRes.fromJson(Map<String, Object?> json) =>
      _$AdminReviewSummariesResFromJson(json);

  final List<AdminReviewSummary> summaries;

  Map<String, Object?> toJson() => _$AdminReviewSummariesResToJson(this);
}
