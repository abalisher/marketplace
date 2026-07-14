// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_user_delete_response.g.dart';

/// The details of the deleted user.
@JsonSerializable()
class AdminUserDeleteResponse {
  const AdminUserDeleteResponse({
    required this.id,
    required this.deleted,
    this.object = 'user',
  });

  factory AdminUserDeleteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminUserDeleteResponseFromJson(json);

  /// The user's ID.
  final String id;

  /// The name of the deleted object.
  final String object;

  /// Whether the user was deleted.
  final bool deleted;

  Map<String, Object?> toJson() => _$AdminUserDeleteResponseToJson(this);
}
