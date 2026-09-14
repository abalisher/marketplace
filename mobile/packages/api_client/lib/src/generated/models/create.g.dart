// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Create _$CreateFromJson(Map<String, dynamic> json) => Create(
  entity: json['entity'] as String,
  property: json['property'] as String,
  label: json['label'] as String,
  description: json['description'] as String?,
);

Map<String, dynamic> _$CreateToJson(Create instance) => <String, dynamic>{
  'entity': instance.entity,
  'property': instance.property,
  'label': instance.label,
  'description': ?instance.description,
};
