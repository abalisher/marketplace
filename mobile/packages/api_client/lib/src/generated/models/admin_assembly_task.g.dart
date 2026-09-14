// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_assembly_task.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAssemblyTask _$AdminAssemblyTaskFromJson(Map<String, dynamic> json) =>
    AdminAssemblyTask(
      id: json['id'] as String,
      orderId: json['order_id'] as String,
      categoryHandle: json['category_handle'] as String,
      categoryName: json['category_name'] as String,
      status: AdminAssemblyTaskStatus.fromJson(json['status'] as String),
      itemsTotal: json['items_total'] as num,
      itemsMarked: json['items_marked'] as num,
      itemsMissing: json['items_missing'] as num,
      items: (json['items'] as List<dynamic>)
          .map((e) => AdminAssemblyTaskItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      orderDisplayId: json['order_display_id'] as num?,
      customerName: json['customer_name'] as String?,
      assigneeId: json['assignee_id'] as String?,
      startedAt: json['started_at'] == null
          ? null
          : DateTime.parse(json['started_at'] as String),
      completedAt: json['completed_at'] == null
          ? null
          : DateTime.parse(json['completed_at'] as String),
      completedBy: json['completed_by'] as String?,
      note: json['note'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$AdminAssemblyTaskToJson(AdminAssemblyTask instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_id': instance.orderId,
      'order_display_id': ?instance.orderDisplayId,
      'customer_name': ?instance.customerName,
      'category_handle': instance.categoryHandle,
      'category_name': instance.categoryName,
      'status': _$AdminAssemblyTaskStatusEnumMap[instance.status]!,
      'assignee_id': ?instance.assigneeId,
      'started_at': ?instance.startedAt?.toIso8601String(),
      'completed_at': ?instance.completedAt?.toIso8601String(),
      'completed_by': ?instance.completedBy,
      'note': ?instance.note,
      'created_at': ?instance.createdAt?.toIso8601String(),
      'items_total': instance.itemsTotal,
      'items_marked': instance.itemsMarked,
      'items_missing': instance.itemsMissing,
      'items': instance.items,
    };

const _$AdminAssemblyTaskStatusEnumMap = {
  AdminAssemblyTaskStatus.pending: 'pending',
  AdminAssemblyTaskStatus.picking: 'picking',
  AdminAssemblyTaskStatus.assembled: 'assembled',
  AdminAssemblyTaskStatus.shortage: 'shortage',
  AdminAssemblyTaskStatus.$unknown: r'$unknown',
};
