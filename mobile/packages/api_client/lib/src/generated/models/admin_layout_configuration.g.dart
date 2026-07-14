// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_layout_configuration.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminLayoutConfiguration _$AdminLayoutConfigurationFromJson(
  Map<String, dynamic> json,
) => AdminLayoutConfiguration(
  id: json['id'] as String,
  zone: json['zone'] as String,
  userId: json['user_id'] as String,
  isSystemDefault: json['is_system_default'] as bool,
  configuration: Configuration2.fromJson(
    json['configuration'] as Map<String, dynamic>,
  ),
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
);

Map<String, dynamic> _$AdminLayoutConfigurationToJson(
  AdminLayoutConfiguration instance,
) => <String, dynamic>{
  'id': instance.id,
  'zone': instance.zone,
  'user_id': instance.userId,
  'is_system_default': instance.isSystemDefault,
  'configuration': instance.configuration,
  'created_at': instance.createdAt.toIso8601String(),
  'updated_at': instance.updatedAt.toIso8601String(),
};
