// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'auth_response.g.dart';

/// The authentication's details.
@JsonSerializable()
class AuthResponse {
  const AuthResponse({required this.token});

  factory AuthResponse.fromJson(Map<String, Object?> json) =>
      _$AuthResponseFromJson(json);

  /// The JWT token used for registration or authentication.
  final String token;

  Map<String, Object?> toJson() => _$AuthResponseToJson(this);
}
