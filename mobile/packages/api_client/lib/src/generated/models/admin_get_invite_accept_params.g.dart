// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_get_invite_accept_params.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminGetInviteAcceptParams _$AdminGetInviteAcceptParamsFromJson(
  Map<String, dynamic> json,
) => AdminGetInviteAcceptParams(
  email: json['email'] as String?,
  firstName: json['first_name'] as String?,
  lastName: json['last_name'] as String?,
);

Map<String, dynamic> _$AdminGetInviteAcceptParamsToJson(
  AdminGetInviteAcceptParams instance,
) => <String, dynamic>{
  'email': ?instance.email,
  'first_name': ?instance.firstName,
  'last_name': ?instance.lastName,
};
