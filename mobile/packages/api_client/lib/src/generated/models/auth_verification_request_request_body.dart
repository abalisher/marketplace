// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'auth_verification_request_request_body.g.dart';

@JsonSerializable()
class AuthVerificationRequestRequestBody {
  const AuthVerificationRequestRequestBody({
    required this.entityId,
    required this.entityType,
    required this.codeProvider,
    this.metadata,
  });

  factory AuthVerificationRequestRequestBody.fromJson(
    Map<String, Object?> json,
  ) => _$AuthVerificationRequestRequestBodyFromJson(json);

  /// The identifier of the user or customer. For example, an email address.
  @JsonKey(name: 'entity_id')
  final String entityId;

  /// The type of identity being verified. For example, "email" or "phone_number".
  @JsonKey(name: 'entity_type')
  final String entityType;

  /// The provider to use to create the verification token or code. By default, Medusa provides a `token` provider that generates a random token. You can also implement your own provider to generate a code or OTP.
  @JsonKey(name: 'code_provider')
  final String codeProvider;

  /// Custom key-value pairs that can be passed to the verification request. This is optional and can be used to store additional information related to the verification request.
  final dynamic metadata;

  Map<String, Object?> toJson() =>
      _$AuthVerificationRequestRequestBodyToJson(this);
}
