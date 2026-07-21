// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'auth_response.dart';
import 'auth_callback_response.dart';

part 'post_auth_user_auth_provider_response_sealed.g.dart';

@JsonSerializable(createFactory: false)
sealed class PostAuthUserAuthProviderResponseSealed {
  const PostAuthUserAuthProviderResponseSealed();

  factory PostAuthUserAuthProviderResponseSealed.fromJson(
    Map<String, dynamic> json,
  ) => PostAuthUserAuthProviderResponseSealedDeserializer.tryDeserialize(json);

  Map<String, dynamic> toJson();
}

extension PostAuthUserAuthProviderResponseSealedDeserializer
    on PostAuthUserAuthProviderResponseSealed {
  static PostAuthUserAuthProviderResponseSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return PostAuthUserAuthProviderResponseSealedAuthResponse.fromJson(json);
    } catch (_) {}
    try {
      return PostAuthUserAuthProviderResponseSealedAuthCallbackResponse.fromJson(
        json,
      );
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for PostAuthUserAuthProviderResponseSealed from: $json',
    );
  }
}

@JsonSerializable()
class PostAuthUserAuthProviderResponseSealedAuthResponse
    extends PostAuthUserAuthProviderResponseSealed
    implements AuthResponse {
  @override
  final String token;

  const PostAuthUserAuthProviderResponseSealedAuthResponse({
    required this.token,
  });

  factory PostAuthUserAuthProviderResponseSealedAuthResponse.fromJson(
    Map<String, dynamic> json,
  ) => _$PostAuthUserAuthProviderResponseSealedAuthResponseFromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$PostAuthUserAuthProviderResponseSealedAuthResponseToJson(this);
}

@JsonSerializable()
class PostAuthUserAuthProviderResponseSealedAuthCallbackResponse
    extends PostAuthUserAuthProviderResponseSealed
    implements AuthCallbackResponse {
  @override
  final String location;

  const PostAuthUserAuthProviderResponseSealedAuthCallbackResponse({
    required this.location,
  });

  factory PostAuthUserAuthProviderResponseSealedAuthCallbackResponse.fromJson(
    Map<String, dynamic> json,
  ) => _$PostAuthUserAuthProviderResponseSealedAuthCallbackResponseFromJson(
    json,
  );

  @override
  Map<String, dynamic> toJson() =>
      _$PostAuthUserAuthProviderResponseSealedAuthCallbackResponseToJson(this);
}
