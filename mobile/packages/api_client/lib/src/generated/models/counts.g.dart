// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'counts.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Counts _$CountsFromJson(Map<String, dynamic> json) => Counts(
  total: (json['total'] as num).toInt(),
  published: (json['published'] as num).toInt(),
  hidden: (json['hidden'] as num).toInt(),
);

Map<String, dynamic> _$CountsToJson(Counts instance) => <String, dynamic>{
  'total': instance.total,
  'published': instance.published,
  'hidden': instance.hidden,
};
