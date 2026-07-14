// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_view_configuration.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminViewConfiguration _$AdminViewConfigurationFromJson(
  Map<String, dynamic> json,
) => AdminViewConfiguration(
  id: json['id'] as String,
  entity: json['entity'] as String,
  name: json['name'] as String,
  userId: json['user_id'] as String,
  isSystemDefault: json['is_system_default'] as bool,
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  configuration: json['configuration'] == null
      ? null
      : Configuration5.fromJson(json['configuration'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminViewConfigurationToJson(
  AdminViewConfiguration instance,
) => <String, dynamic>{
  'id': instance.id,
  'entity': instance.entity,
  'name': instance.name,
  'user_id': instance.userId,
  'is_system_default': instance.isSystemDefault,
  'configuration': instance.configuration,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
};
