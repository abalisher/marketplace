// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_rbac_role.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminRbacRole _$AdminRbacRoleFromJson(Map<String, dynamic> json) =>
    AdminRbacRole(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      parentId: json['parent_id'] as String,
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      deletedAt: DateTime.parse(json['deleted_at'] as String),
      policies: (json['policies'] as List<dynamic>?)
          ?.map((e) => AdminRbacPolicy.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminRbacRoleToJson(AdminRbacRole instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'parent_id': instance.parentId,
      'metadata': instance.metadata,
      'policies': instance.policies,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
      'deleted_at': instance.deletedAt.toIso8601String(),
    };
