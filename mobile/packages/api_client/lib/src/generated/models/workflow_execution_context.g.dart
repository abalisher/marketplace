// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'workflow_execution_context.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WorkflowExecutionContext _$WorkflowExecutionContextFromJson(
  Map<String, dynamic> json,
) => WorkflowExecutionContext(
  compensate: json['compensate'],
  errors: (json['errors'] as List<dynamic>)
      .map((e) => Errors.fromJson(e as Map<String, dynamic>))
      .toList(),
  data: json['data'] == null
      ? null
      : Data2.fromJson(json['data'] as Map<String, dynamic>),
);

Map<String, dynamic> _$WorkflowExecutionContextToJson(
  WorkflowExecutionContext instance,
) => <String, dynamic>{
  'data': ?instance.data,
  'compensate': ?instance.compensate,
  'errors': instance.errors,
};
