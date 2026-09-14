// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'summary3.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Summary3 _$Summary3FromJson(Map<String, dynamic> json) => Summary3(
  rows: (json['rows'] as num).toInt(),
  changes: (json['changes'] as num).toInt(),
  unchanged: (json['unchanged'] as num).toInt(),
  issues: (json['issues'] as num).toInt(),
);

Map<String, dynamic> _$Summary3ToJson(Summary3 instance) => <String, dynamic>{
  'rows': instance.rows,
  'changes': instance.changes,
  'unchanged': instance.unchanged,
  'issues': instance.issues,
};
