// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_dispute_counts.g.dart';

@JsonSerializable()
class AdminDisputeCounts {
  const AdminDisputeCounts({
    required this.total,
    required this.byStatus,
    required this.overdue,
  });

  factory AdminDisputeCounts.fromJson(Map<String, Object?> json) =>
      _$AdminDisputeCountsFromJson(json);

  final int total;
  @JsonKey(name: 'by_status')
  final Map<String, int> byStatus;
  final int overdue;

  Map<String, Object?> toJson() => _$AdminDisputeCountsToJson(this);
}
