// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_entity_info.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminEntityInfo _$AdminEntityInfoFromJson(Map<String, dynamic> json) =>
    AdminEntityInfo(
      name: json['name'] as String,
      pluralName: json['pluralName'] as String,
      module: json['module'] as String,
      propertyCount: json['propertyCount'] as num,
      hasOverrides: json['hasOverrides'] as bool,
    );

Map<String, dynamic> _$AdminEntityInfoToJson(AdminEntityInfo instance) =>
    <String, dynamic>{
      'name': instance.name,
      'pluralName': instance.pluralName,
      'module': instance.module,
      'propertyCount': instance.propertyCount,
      'hasOverrides': instance.hasOverrides,
    };
