// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_user.dart';

part 'admin_user_response.g.dart';

/// The user's details.
@JsonSerializable()
class AdminUserResponse {
  const AdminUserResponse({required this.user});

  factory AdminUserResponse.fromJson(Map<String, Object?> json) =>
      _$AdminUserResponseFromJson(json);

  final AdminUser user;

  Map<String, Object?> toJson() => _$AdminUserResponseToJson(this);
}
