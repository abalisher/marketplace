// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'deleted2.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Deleted2 _$Deleted2FromJson(Map<String, dynamic> json) => Deleted2(
  ids: (json['ids'] as List<dynamic>).map((e) => e as String).toList(),
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'variant',
);

Map<String, dynamic> _$Deleted2ToJson(Deleted2 instance) => <String, dynamic>{
  'ids': instance.ids,
  'object': instance.object,
  'deleted': instance.deleted,
};
