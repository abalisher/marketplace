// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_dispute_counts.dart';
import 'admin_dispute_row.dart';

part 'admin_disputes_list_res.g.dart';

@JsonSerializable()
class AdminDisputesListRes {
  const AdminDisputesListRes({
    required this.disputes,
    required this.counts,
    required this.slaHours,
    required this.count,
    required this.offset,
    required this.limit,
  });

  factory AdminDisputesListRes.fromJson(Map<String, Object?> json) =>
      _$AdminDisputesListResFromJson(json);

  final List<AdminDisputeRow> disputes;
  final AdminDisputeCounts counts;

  /// Срок ответа по претензии в часах.
  @JsonKey(name: 'sla_hours')
  final int slaHours;
  final int count;
  final int offset;
  final int limit;

  Map<String, Object?> toJson() => _$AdminDisputesListResToJson(this);
}
