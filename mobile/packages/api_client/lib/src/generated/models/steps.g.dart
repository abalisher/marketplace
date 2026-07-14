// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'steps.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Steps _$StepsFromJson(Map<String, dynamic> json) => Steps(
  id: json['id'] as String?,
  invoke: json['invoke'] == null
      ? null
      : WorkflowExecutionFn.fromJson(json['invoke'] as Map<String, dynamic>),
  definition: json['definition'] == null
      ? null
      : WorkflowExecutionDefinition.fromJson(
          json['definition'] as Map<String, dynamic>,
        ),
  compensate: json['compensate'] == null
      ? null
      : WorkflowExecutionFn.fromJson(
          json['compensate'] as Map<String, dynamic>,
        ),
  depth: json['depth'] as num?,
  startedAt: json['startedAt'] as num?,
);

Map<String, dynamic> _$StepsToJson(Steps instance) => <String, dynamic>{
  'id': instance.id,
  'invoke': instance.invoke,
  'definition': instance.definition,
  'compensate': instance.compensate,
  'depth': instance.depth,
  'startedAt': instance.startedAt,
};
