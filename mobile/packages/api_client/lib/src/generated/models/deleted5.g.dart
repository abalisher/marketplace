// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'deleted5.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Deleted5 _$Deleted5FromJson(Map<String, dynamic> json) => Deleted5(
  ids: (json['ids'] as List<dynamic>).map((e) => e as String).toList(),
  deleted: json['deleted'] as bool,
  object: json['object'] as String? ?? 'price',
);

Map<String, dynamic> _$Deleted5ToJson(Deleted5 instance) => <String, dynamic>{
  'ids': instance.ids,
  'object': instance.object,
  'deleted': instance.deleted,
};
