// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_rbac_policy.dart';

part 'admin_rbac_role.g.dart';

/// The details of an RBAC role.
@JsonSerializable()
class AdminRbacRole {
  const AdminRbacRole({
    required this.id,
    required this.name,
    required this.description,
    required this.parentId,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    this.policies,
  });

  factory AdminRbacRole.fromJson(Map<String, Object?> json) =>
      _$AdminRbacRoleFromJson(json);

  /// The ID of the RBAC role.
  final String id;

  /// The name of the RBAC role.
  final String name;

  /// The description of the RBAC role.
  final String description;

  /// The ID of the parent RBAC role.
  @JsonKey(name: 'parent_id')
  final String parentId;

  /// Key-value pairs that hold additional information about the RBAC role.
  final dynamic metadata;

  /// The RBAC role's policies.
  final List<AdminRbacPolicy>? policies;

  /// The date the RBAC role was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the RBAC role was last updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the RBAC role was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime deletedAt;

  Map<String, Object?> toJson() => _$AdminRbacRoleToJson(this);
}
