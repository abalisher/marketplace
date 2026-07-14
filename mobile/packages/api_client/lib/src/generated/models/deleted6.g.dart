// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'deleted6.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Deleted6 _$Deleted6FromJson(Map<String, dynamic> json) => Deleted6(
  ids: (json['ids'] as List<dynamic>).map((e) => e as String).toList(),
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'translation',
);

Map<String, dynamic> _$Deleted6ToJson(Deleted6 instance) => <String, dynamic>{
  'ids': instance.ids,
  'object': instance.object,
  'deleted': instance.deleted,
};
