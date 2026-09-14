// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_user_auth_providers_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminUserAuthProvidersResponse _$AdminUserAuthProvidersResponseFromJson(
  Map<String, dynamic> json,
) => AdminUserAuthProvidersResponse(
  providers: (json['providers'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$AdminUserAuthProvidersResponseToJson(
  AdminUserAuthProvidersResponse instance,
) => <String, dynamic>{'providers': instance.providers};
