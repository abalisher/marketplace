// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_review_row.dart';
import 'admin_review_summary.dart';
import 'counts.dart';

part 'admin_reviews_list_res.g.dart';

@JsonSerializable()
class AdminReviewsListRes {
  const AdminReviewsListRes({
    required this.reviews,
    required this.counts,
    required this.summaries,
    required this.count,
    required this.offset,
    required this.limit,
  });

  factory AdminReviewsListRes.fromJson(Map<String, Object?> json) =>
      _$AdminReviewsListResFromJson(json);

  final List<AdminReviewRow> reviews;
  final Counts counts;
  final List<AdminReviewSummary> summaries;
  final int count;
  final int offset;
  final int limit;

  Map<String, Object?> toJson() => _$AdminReviewsListResToJson(this);
}
