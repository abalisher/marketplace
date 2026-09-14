// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_rbac_policy.g.dart';

/// The details of an RBAC policy.
@JsonSerializable()
class AdminRbacPolicy {
  const AdminRbacPolicy({
    required this.id,
    required this.key,
    required this.resource,
    required this.operation,
    required this.name,
    required this.description,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
    this.inheritedFromRoleId,
  });

  factory AdminRbacPolicy.fromJson(Map<String, Object?> json) =>
      _$AdminRbacPolicyFromJson(json);

  /// The policy's ID.
  final String id;

  /// The policy's key.
  final String key;

  /// The resource that the policy applies to.
  final String resource;

  /// The operation that the policy allows or denies.
  final String operation;

  /// The policy's name. Used for display purposes.
  final String name;

  /// The policy's description.
  final String? description;

  /// Key-value pairs that hold additional information about the policy.
  final dynamic metadata;

  /// The ID of the role from which the policy is inherited.
  @JsonKey(name: 'inherited_from_role_id')
  final String? inheritedFromRoleId;

  /// The date the policy was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the policy was last updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the policy was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminRbacPolicyToJson(this);
}
