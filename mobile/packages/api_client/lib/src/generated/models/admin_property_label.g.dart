// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_property_label.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPropertyLabel _$AdminPropertyLabelFromJson(Map<String, dynamic> json) =>
    AdminPropertyLabel(
      id: json['id'] as String,
      entity: json['entity'] as String,
      property: json['property'] as String,
      label: json['label'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      description: json['description'] as String?,
    );

Map<String, dynamic> _$AdminPropertyLabelToJson(AdminPropertyLabel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'entity': instance.entity,
      'property': instance.property,
      'label': instance.label,
      'description': ?instance.description,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
    };
