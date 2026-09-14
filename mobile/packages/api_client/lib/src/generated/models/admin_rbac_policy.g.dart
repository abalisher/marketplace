// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_rbac_policy.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminRbacPolicy _$AdminRbacPolicyFromJson(Map<String, dynamic> json) =>
    AdminRbacPolicy(
      id: json['id'] as String,
      key: json['key'] as String,
      resource: json['resource'] as String,
      operation: json['operation'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: json['deleted_at'] == null
          ? null
          : DateTime.parse(json['deleted_at'] as String),
      inheritedFromRoleId: json['inherited_from_role_id'] as String?,
    );

Map<String, dynamic> _$AdminRbacPolicyToJson(AdminRbacPolicy instance) =>
    <String, dynamic>{
      'id': instance.id,
      'key': instance.key,
      'resource': instance.resource,
      'operation': instance.operation,
      'name': instance.name,
      'description': ?instance.description,
      'metadata': ?instance.metadata,
      'inherited_from_role_id': ?instance.inheritedFromRoleId,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': ?instance.deletedAt?.toIso8601String(),
    };
