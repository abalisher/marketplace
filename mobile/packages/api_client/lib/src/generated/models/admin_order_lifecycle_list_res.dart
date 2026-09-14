// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_order_lifecycle.dart';
import 'admin_order_lifecycle_counts.dart';

part 'admin_order_lifecycle_list_res.g.dart';

@JsonSerializable()
class AdminOrderLifecycleListRes {
  const AdminOrderLifecycleListRes({
    required this.orderLifecycles,
    required this.counts,
    required this.count,
    required this.offset,
    required this.limit,
  });

  factory AdminOrderLifecycleListRes.fromJson(Map<String, Object?> json) =>
      _$AdminOrderLifecycleListResFromJson(json);

  @JsonKey(name: 'order_lifecycles')
  final List<AdminOrderLifecycle> orderLifecycles;
  final AdminOrderLifecycleCounts counts;
  final int count;
  final int offset;
  final int limit;

  Map<String, Object?> toJson() => _$AdminOrderLifecycleListResToJson(this);
}
