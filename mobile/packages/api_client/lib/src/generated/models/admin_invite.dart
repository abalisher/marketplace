// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_rbac_role.dart';

part 'admin_invite.g.dart';

/// The invite's details.
@JsonSerializable()
class AdminInvite {
  const AdminInvite({
    required this.id,
    required this.email,
    required this.accepted,
    required this.token,
    required this.expiresAt,
    required this.createdAt,
    required this.updatedAt,
    this.metadata,
    this.rbacRoles,
  });

  factory AdminInvite.fromJson(Map<String, Object?> json) =>
      _$AdminInviteFromJson(json);

  /// The invite's ID.
  final String id;

  /// The invite's email.
  final String email;

  /// Whether the invite has been accepted.
  final bool accepted;

  /// The invite's token.
  final String token;

  /// The invite's expiry date.
  @JsonKey(name: 'expires_at')
  final DateTime expiresAt;

  /// The invite's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the invite was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the invite was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The roles of the invited user.
  @JsonKey(name: 'rbac_roles')
  final List<AdminRbacRole>? rbacRoles;

  Map<String, Object?> toJson() => _$AdminInviteToJson(this);
}
