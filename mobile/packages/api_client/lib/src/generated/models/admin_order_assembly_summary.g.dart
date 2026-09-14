// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_assembly_summary.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderAssemblySummary _$AdminOrderAssemblySummaryFromJson(
  Map<String, dynamic> json,
) => AdminOrderAssemblySummary(
  tasksTotal: json['tasks_total'] as num,
  tasksFinished: json['tasks_finished'] as num,
  tasksAssembled: json['tasks_assembled'] as num,
  tasksShortage: json['tasks_shortage'] as num,
  isFinished: json['is_finished'] as bool,
  isAssembled: json['is_assembled'] as bool,
  hasShortage: json['has_shortage'] as bool,
);

Map<String, dynamic> _$AdminOrderAssemblySummaryToJson(
  AdminOrderAssemblySummary instance,
) => <String, dynamic>{
  'tasks_total': instance.tasksTotal,
  'tasks_finished': instance.tasksFinished,
  'tasks_assembled': instance.tasksAssembled,
  'tasks_shortage': instance.tasksShortage,
  'is_finished': instance.isFinished,
  'is_assembled': instance.isAssembled,
  'has_shortage': instance.hasShortage,
};
