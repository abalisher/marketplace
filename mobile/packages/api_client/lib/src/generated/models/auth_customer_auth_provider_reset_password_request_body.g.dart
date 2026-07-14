// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_customer_auth_provider_reset_password_request_body.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthCustomerAuthProviderResetPasswordRequestBody
_$AuthCustomerAuthProviderResetPasswordRequestBodyFromJson(
  Map<String, dynamic> json,
) => AuthCustomerAuthProviderResetPasswordRequestBody(
  identifier: json['identifier'] as String,
  metadata: json['metadata'],
);

Map<String, dynamic> _$AuthCustomerAuthProviderResetPasswordRequestBodyToJson(
  AuthCustomerAuthProviderResetPasswordRequestBody instance,
) => <String, dynamic>{
  'identifier': instance.identifier,
  'metadata': instance.metadata,
};
