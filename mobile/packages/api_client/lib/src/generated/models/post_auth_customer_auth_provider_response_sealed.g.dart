// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'post_auth_customer_auth_provider_response_sealed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Map<String, dynamic> _$PostAuthCustomerAuthProviderResponseSealedToJson(
  PostAuthCustomerAuthProviderResponseSealed instance,
) => <String, dynamic>{};

PostAuthCustomerAuthProviderResponseSealedAuthResponse
_$PostAuthCustomerAuthProviderResponseSealedAuthResponseFromJson(
  Map<String, dynamic> json,
) => PostAuthCustomerAuthProviderResponseSealedAuthResponse(
  token: json['token'] as String,
);

Map<String, dynamic>
_$PostAuthCustomerAuthProviderResponseSealedAuthResponseToJson(
  PostAuthCustomerAuthProviderResponseSealedAuthResponse instance,
) => <String, dynamic>{'token': instance.token};

PostAuthCustomerAuthProviderResponseSealedAuthCallbackResponse
_$PostAuthCustomerAuthProviderResponseSealedAuthCallbackResponseFromJson(
  Map<String, dynamic> json,
) => PostAuthCustomerAuthProviderResponseSealedAuthCallbackResponse(
  location: json['location'] as String,
);

Map<String, dynamic>
_$PostAuthCustomerAuthProviderResponseSealedAuthCallbackResponseToJson(
  PostAuthCustomerAuthProviderResponseSealedAuthCallbackResponse instance,
) => <String, dynamic>{'location': instance.location};
