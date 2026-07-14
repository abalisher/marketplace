// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_plugins_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminPluginsListResponse _$AdminPluginsListResponseFromJson(
  Map<String, dynamic> json,
) => AdminPluginsListResponse(
  plugins: (json['plugins'] as List<dynamic>)
      .map((e) => AdminPlugin.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminPluginsListResponseToJson(
  AdminPluginsListResponse instance,
) => <String, dynamic>{'plugins': instance.plugins};
