// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_view_configuration_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminViewConfigurationResponse _$AdminViewConfigurationResponseFromJson(
  Map<String, dynamic> json,
) => AdminViewConfigurationResponse(
  viewConfiguration: AdminViewConfiguration.fromJson(
    json['view_configuration'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$AdminViewConfigurationResponseToJson(
  AdminViewConfigurationResponse instance,
) => <String, dynamic>{'view_configuration': instance.viewConfiguration};
