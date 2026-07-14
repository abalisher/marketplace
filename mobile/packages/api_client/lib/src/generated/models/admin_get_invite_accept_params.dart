// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_get_invite_accept_params.g.dart';

/// The details of the user to be created.
@JsonSerializable()
class AdminGetInviteAcceptParams {
  const AdminGetInviteAcceptParams({required this.token, this.fields});

  factory AdminGetInviteAcceptParams.fromJson(Map<String, Object?> json) =>
      _$AdminGetInviteAcceptParamsFromJson(json);

  /// The invite's token.
  final String token;

  /// The invite's fields.
  final String? fields;

  Map<String, Object?> toJson() => _$AdminGetInviteAcceptParamsToJson(this);
}
