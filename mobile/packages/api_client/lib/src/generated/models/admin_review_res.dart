// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_review.dart';

part 'admin_review_res.g.dart';

@JsonSerializable()
class AdminReviewRes {
  const AdminReviewRes({required this.review});

  factory AdminReviewRes.fromJson(Map<String, Object?> json) =>
      _$AdminReviewResFromJson(json);

  final AdminReview review;

  Map<String, Object?> toJson() => _$AdminReviewResToJson(this);
}
