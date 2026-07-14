// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_layout_configuration_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminLayoutConfigurationResponse _$AdminLayoutConfigurationResponseFromJson(
  Map<String, dynamic> json,
) => AdminLayoutConfigurationResponse(
  personalConfiguration: AdminLayoutConfiguration.fromJson(
    json['personal_configuration'] as Map<String, dynamic>,
  ),
  defaultConfiguration: AdminLayoutConfiguration.fromJson(
    json['default_configuration'] as Map<String, dynamic>,
  ),
  activeScope: AdminLayoutConfigurationResponseActiveScope.fromJson(
    json['active_scope'] as String,
  ),
);

Map<String, dynamic> _$AdminLayoutConfigurationResponseToJson(
  AdminLayoutConfigurationResponse instance,
) => <String, dynamic>{
  'personal_configuration': instance.personalConfiguration,
  'default_configuration': instance.defaultConfiguration,
  'active_scope':
      _$AdminLayoutConfigurationResponseActiveScopeEnumMap[instance
          .activeScope]!,
};

const _$AdminLayoutConfigurationResponseActiveScopeEnumMap = {
  AdminLayoutConfigurationResponseActiveScope.valueDefault: 'default',
  AdminLayoutConfigurationResponseActiveScope.personal: 'personal',
  AdminLayoutConfigurationResponseActiveScope.$unknown: r'$unknown',
};
