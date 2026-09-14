// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_set_layout_configuration.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminSetLayoutConfiguration _$AdminSetLayoutConfigurationFromJson(
  Map<String, dynamic> json,
) => AdminSetLayoutConfiguration(
  configuration: Configuration3.fromJson(
    json['configuration'] as Map<String, dynamic>,
  ),
  isDefault: json['is_default'] as bool?,
);

Map<String, dynamic> _$AdminSetLayoutConfigurationToJson(
  AdminSetLayoutConfiguration instance,
) => <String, dynamic>{
  'is_default': ?instance.isDefault,
  'configuration': instance.configuration,
};
