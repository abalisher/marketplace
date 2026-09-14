// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_assembly_task_complete_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminAssemblyTaskCompleteRes _$AdminAssemblyTaskCompleteResFromJson(
  Map<String, dynamic> json,
) => AdminAssemblyTaskCompleteRes(
  assemblyTask: AdminAssemblyTask.fromJson(
    json['assembly_task'] as Map<String, dynamic>,
  ),
  orderAssembly: AdminOrderAssemblySummary.fromJson(
    json['order_assembly'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminAssemblyTaskCompleteResToJson(
  AdminAssemblyTaskCompleteRes instance,
) => <String, dynamic>{
  'assembly_task': instance.assemblyTask,
  'order_assembly': instance.orderAssembly,
};
