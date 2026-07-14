// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_store_session_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuthStoreSessionResponse _$AuthStoreSessionResponseFromJson(
  Map<String, dynamic> json,
) => AuthStoreSessionResponse(
  user: StoreCustomer.fromJson(json['user'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AuthStoreSessionResponseToJson(
  AuthStoreSessionResponse instance,
) => <String, dynamic>{'user': instance.user};
