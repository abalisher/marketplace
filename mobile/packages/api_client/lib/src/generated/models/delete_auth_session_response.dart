// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'delete_auth_session_response.g.dart';

@JsonSerializable()
class DeleteAuthSessionResponse {
  const DeleteAuthSessionResponse({required this.success});

  factory DeleteAuthSessionResponse.fromJson(Map<String, Object?> json) =>
      _$DeleteAuthSessionResponseFromJson(json);

  /// Whether the session was deleted successfully.
  final bool success;

  Map<String, Object?> toJson() => _$DeleteAuthSessionResponseToJson(this);
}
