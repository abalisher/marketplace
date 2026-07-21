// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'post_auth_user_auth_provider_response_sealed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Map<String, dynamic> _$PostAuthUserAuthProviderResponseSealedToJson(
  PostAuthUserAuthProviderResponseSealed instance,
) => <String, dynamic>{};

PostAuthUserAuthProviderResponseSealedAuthResponse
_$PostAuthUserAuthProviderResponseSealedAuthResponseFromJson(
  Map<String, dynamic> json,
) => PostAuthUserAuthProviderResponseSealedAuthResponse(
  token: json['token'] as String,
);

Map<String, dynamic> _$PostAuthUserAuthProviderResponseSealedAuthResponseToJson(
  PostAuthUserAuthProviderResponseSealedAuthResponse instance,
) => <String, dynamic>{'token': instance.token};

PostAuthUserAuthProviderResponseSealedAuthCallbackResponse
_$PostAuthUserAuthProviderResponseSealedAuthCallbackResponseFromJson(
  Map<String, dynamic> json,
) => PostAuthUserAuthProviderResponseSealedAuthCallbackResponse(
  location: json['location'] as String,
);

Map<String, dynamic>
_$PostAuthUserAuthProviderResponseSealedAuthCallbackResponseToJson(
  PostAuthUserAuthProviderResponseSealedAuthCallbackResponse instance,
) => <String, dynamic>{'location': instance.location};
