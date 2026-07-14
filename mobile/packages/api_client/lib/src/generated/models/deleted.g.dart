// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'deleted.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Deleted _$DeletedFromJson(Map<String, dynamic> json) => Deleted(
  ids: (json['ids'] as List<dynamic>).map((e) => e as String).toList(),
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'product',
);

Map<String, dynamic> _$DeletedToJson(Deleted instance) => <String, dynamic>{
  'ids': instance.ids,
  'object': instance.object,
  'deleted': instance.deleted,
};
