// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_user.g.dart';

/// The user's details.
@JsonSerializable()
class AdminUser {
  const AdminUser({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.avatarUrl,
    required this.metadata,
    required this.createdAt,
    required this.updatedAt,
    required this.deletedAt,
  });

  factory AdminUser.fromJson(Map<String, Object?> json) =>
      _$AdminUserFromJson(json);

  /// The user's ID.
  final String id;

  /// The user's email.
  final String email;

  /// The user's first name.
  @JsonKey(name: 'first_name')
  final String? firstName;

  /// The user's last name.
  @JsonKey(name: 'last_name')
  final String? lastName;

  /// The URL of the user's avatar.
  @JsonKey(name: 'avatar_url')
  final String avatarUrl;

  /// The user's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  /// The date the user was created.
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  /// The date the user was updated.
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  /// The date the user was deleted.
  @JsonKey(name: 'deleted_at')
  final DateTime? deletedAt;

  Map<String, Object?> toJson() => _$AdminUserToJson(this);
}
