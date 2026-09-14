// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_provider.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthProvider _$AuthProviderFromJson(Map<String, dynamic> json) => AuthProvider(
  id: json['id'] as String,
  identifier: json['identifier'] as String,
  displayName: json['display_name'] as String,
  flow: AuthProviderFlow.fromJson(json['flow'] as String),
);

Map<String, dynamic> _$AuthProviderToJson(AuthProvider instance) =>
    <String, dynamic>{
      'id': instance.id,
      'identifier': instance.identifier,
      'display_name': instance.displayName,
      'flow': _$AuthProviderFlowEnumMap[instance.flow]!,
    };

const _$AuthProviderFlowEnumMap = {
  AuthProviderFlow.credentials: 'credentials',
  AuthProviderFlow.redirect: 'redirect',
  AuthProviderFlow.$unknown: r'$unknown',
};
