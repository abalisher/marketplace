// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_create_view_configuration.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminCreateViewConfiguration _$AdminCreateViewConfigurationFromJson(
  Map<String, dynamic> json,
) => AdminCreateViewConfiguration(
  isSystemDefault: json['is_system_default'] as bool?,
  setActive: json['set_active'] as bool?,
  configuration: json['configuration'] == null
      ? null
      : Configuration.fromJson(json['configuration'] as Map<String, dynamic>),
  name: json['name'] as String?,
);

Map<String, dynamic> _$AdminCreateViewConfigurationToJson(
  AdminCreateViewConfiguration instance,
) => <String, dynamic>{
  'is_system_default': ?instance.isSystemDefault,
  'set_active': ?instance.setActive,
  'configuration': ?instance.configuration,
  'name': ?instance.name,
};
