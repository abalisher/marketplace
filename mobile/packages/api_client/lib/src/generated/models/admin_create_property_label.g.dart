// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_property_label.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreatePropertyLabel _$AdminCreatePropertyLabelFromJson(
  Map<String, dynamic> json,
) => AdminCreatePropertyLabel(
  entity: json['entity'] as String,
  property: json['property'] as String,
  label: json['label'] as String,
  description: json['description'] as String?,
);

Map<String, dynamic> _$AdminCreatePropertyLabelToJson(
  AdminCreatePropertyLabel instance,
) => <String, dynamic>{
  'entity': instance.entity,
  'property': instance.property,
  'label': instance.label,
  'description': instance.description,
};
