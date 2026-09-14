// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_providers_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthProvidersListResponse _$AuthProvidersListResponseFromJson(
  Map<String, dynamic> json,
) => AuthProvidersListResponse(
  providers: (json['providers'] as List<dynamic>)
      .map((e) => AuthProvider.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AuthProvidersListResponseToJson(
  AuthProvidersListResponse instance,
) => <String, dynamic>{'providers': instance.providers};
