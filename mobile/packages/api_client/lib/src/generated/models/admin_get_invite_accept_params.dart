// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_get_invite_accept_params.g.dart';

/// The details of the user to be created.
@JsonSerializable()
class AdminGetInviteAcceptParams {
  const AdminGetInviteAcceptParams({this.email, this.firstName, this.lastName});

  factory AdminGetInviteAcceptParams.fromJson(Map<String, Object?> json) =>
      _$AdminGetInviteAcceptParamsFromJson(json);

  /// The invite's email.
  final String? email;

  /// The invited user's first name.
  @JsonKey(name: 'first_name')
  final String? firstName;

  /// The invited user's last name.
  @JsonKey(name: 'last_name')
  final String? lastName;

  Map<String, Object?> toJson() => _$AdminGetInviteAcceptParamsToJson(this);
}
