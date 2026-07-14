// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'deleted4.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Deleted4 _$Deleted4FromJson(Map<String, dynamic> json) => Deleted4(
  ids: (json['ids'] as List<dynamic>).map((e) => e as String).toList(),
  object: json['object'] as String,
  deleted: json['deleted'] as bool,
);

Map<String, dynamic> _$Deleted4ToJson(Deleted4 instance) => <String, dynamic>{
  'ids': instance.ids,
  'object': instance.object,
  'deleted': instance.deleted,
};
