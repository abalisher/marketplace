// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_invite.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminInvite _$AdminInviteFromJson(Map<String, dynamic> json) => AdminInvite(
  id: json['id'] as String,
  email: json['email'] as String,
  accepted: json['accepted'] as bool,
  token: json['token'] as String,
  expiresAt: DateTime.parse(json['expires_at'] as String),
  createdAt: DateTime.parse(json['created_at'] as String),
  updatedAt: DateTime.parse(json['updated_at'] as String),
  metadata: json['metadata'],
  rbacRoles: (json['rbac_roles'] as List<dynamic>?)
      ?.map((e) => AdminRbacRole.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$AdminInviteToJson(AdminInvite instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'accepted': instance.accepted,
      'token': instance.token,
      'expires_at': instance.expiresAt.toIso8601String(),
      'metadata': instance.metadata,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'rbac_roles': instance.rbacRoles,
    };
