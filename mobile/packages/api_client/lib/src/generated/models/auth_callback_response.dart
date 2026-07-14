// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'auth_callback_response.g.dart';

/// The authentication's details.
@JsonSerializable()
class AuthCallbackResponse {
  const AuthCallbackResponse({required this.location});

  factory AuthCallbackResponse.fromJson(Map<String, Object?> json) =>
      _$AuthCallbackResponseFromJson(json);

  /// The location to redirect the user to for further authentication with the third-party provider.
  final String location;

  Map<String, Object?> toJson() => _$AuthCallbackResponseToJson(this);
}
