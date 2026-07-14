// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_update_view_configuration.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUpdateViewConfiguration _$AdminUpdateViewConfigurationFromJson(
  Map<String, dynamic> json,
) => AdminUpdateViewConfiguration(
  setActive: json['set_active'] as bool?,
  name: json['name'] as String?,
  isSystemDefault: json['is_system_default'] as bool?,
  configuration: json['configuration'] == null
      ? null
      : Configuration4.fromJson(json['configuration'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AdminUpdateViewConfigurationToJson(
  AdminUpdateViewConfiguration instance,
) => <String, dynamic>{
  'set_active': instance.setActive,
  'name': instance.name,
  'is_system_default': instance.isSystemDefault,
  'configuration': instance.configuration,
};
