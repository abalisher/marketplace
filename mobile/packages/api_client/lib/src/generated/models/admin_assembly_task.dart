// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_assembly_task_item.dart';
import 'admin_assembly_task_status.dart';

part 'admin_assembly_task.g.dart';

@JsonSerializable()
class AdminAssemblyTask {
  const AdminAssemblyTask({
    required this.id,
    required this.orderId,
    required this.categoryHandle,
    required this.categoryName,
    required this.status,
    required this.itemsTotal,
    required this.itemsMarked,
    required this.itemsMissing,
    required this.items,
    this.orderDisplayId,
    this.customerName,
    this.assigneeId,
    this.startedAt,
    this.completedAt,
    this.completedBy,
    this.note,
    this.createdAt,
  });

  factory AdminAssemblyTask.fromJson(Map<String, Object?> json) =>
      _$AdminAssemblyTaskFromJson(json);

  final String id;
  @JsonKey(name: 'order_id')
  final String orderId;
  @JsonKey(name: 'order_display_id')
  final num? orderDisplayId;
  @JsonKey(name: 'customer_name')
  final String? customerName;
  @JsonKey(name: 'category_handle')
  final String categoryHandle;
  @JsonKey(name: 'category_name')
  final String categoryName;
  final AdminAssemblyTaskStatus status;
  @JsonKey(name: 'assignee_id')
  final String? assigneeId;
  @JsonKey(name: 'started_at')
  final DateTime? startedAt;
  @JsonKey(name: 'completed_at')
  final DateTime? completedAt;
  @JsonKey(name: 'completed_by')
  final String? completedBy;
  final String? note;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @JsonKey(name: 'items_total')
  final num itemsTotal;
  @JsonKey(name: 'items_marked')
  final num itemsMarked;
  @JsonKey(name: 'items_missing')
  final num itemsMissing;
  final List<AdminAssemblyTaskItem> items;

  Map<String, Object?> toJson() => _$AdminAssemblyTaskToJson(this);
}
