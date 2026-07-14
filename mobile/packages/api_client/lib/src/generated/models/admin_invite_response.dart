// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_invite.dart';

part 'admin_invite_response.g.dart';

/// The invite's details.
@JsonSerializable()
class AdminInviteResponse {
  const AdminInviteResponse({required this.invite});

  factory AdminInviteResponse.fromJson(Map<String, Object?> json) =>
      _$AdminInviteResponseFromJson(json);

  final AdminInvite invite;

  Map<String, Object?> toJson() => _$AdminInviteResponseToJson(this);
}
