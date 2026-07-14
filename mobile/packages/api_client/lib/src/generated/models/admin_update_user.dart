// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_update_user.g.dart';

/// The properties to update in a user.
@JsonSerializable()
class AdminUpdateUser {
  const AdminUpdateUser({
    this.firstName,
    this.lastName,
    this.avatarUrl,
    this.metadata,
  });

  factory AdminUpdateUser.fromJson(Map<String, Object?> json) =>
      _$AdminUpdateUserFromJson(json);

  /// The user's first name.
  @JsonKey(name: 'first_name')
  final String? firstName;

  /// The user's last name.
  @JsonKey(name: 'last_name')
  final String? lastName;

  /// The URL of the user's avatar.
  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;

  /// The user's metadata, can hold custom key-value pairs.
  final dynamic metadata;

  Map<String, Object?> toJson() => _$AdminUpdateUserToJson(this);
}
