// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_order_assembly_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminOrderAssemblyRes _$AdminOrderAssemblyResFromJson(
  Map<String, dynamic> json,
) => AdminOrderAssemblyRes(
  orderId: json['order_id'] as String,
  assemblyTasks: (json['assembly_tasks'] as List<dynamic>)
      .map((e) => AdminAssemblyTask.fromJson(e as Map<String, dynamic>))
      .toList(),
  summary: AdminOrderAssemblySummary.fromJson(
    json['summary'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminOrderAssemblyResToJson(
  AdminOrderAssemblyRes instance,
) => <String, dynamic>{
  'order_id': instance.orderId,
  'assembly_tasks': instance.assemblyTasks,
  'summary': instance.summary,
};
