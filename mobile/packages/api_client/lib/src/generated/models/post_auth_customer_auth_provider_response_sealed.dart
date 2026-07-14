// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'auth_response.dart';
import 'auth_callback_response.dart';

part 'post_auth_customer_auth_provider_response_sealed.g.dart';

@JsonSerializable(createFactory: false)
sealed class PostAuthCustomerAuthProviderResponseSealed {
  const PostAuthCustomerAuthProviderResponseSealed();

  factory PostAuthCustomerAuthProviderResponseSealed.fromJson(
    Map<String, dynamic> json,
  ) => PostAuthCustomerAuthProviderResponseSealedDeserializer.tryDeserialize(
    json,
  );

  Map<String, dynamic> toJson();
}

extension PostAuthCustomerAuthProviderResponseSealedDeserializer
    on PostAuthCustomerAuthProviderResponseSealed {
  static PostAuthCustomerAuthProviderResponseSealed tryDeserialize(
    Map<String, dynamic> json,
  ) {
    try {
      return PostAuthCustomerAuthProviderResponseSealedAuthResponse.fromJson(
        json,
      );
    } catch (_) {}
    try {
      return PostAuthCustomerAuthProviderResponseSealedAuthCallbackResponse.fromJson(
        json,
      );
    } catch (_) {}

    throw FormatException(
      'Could not determine the correct type for PostAuthCustomerAuthProviderResponseSealed from: $json',
    );
  }
}

@JsonSerializable()
class PostAuthCustomerAuthProviderResponseSealedAuthResponse
    extends PostAuthCustomerAuthProviderResponseSealed
    implements AuthResponse {
  @override
  final String token;

  const PostAuthCustomerAuthProviderResponseSealedAuthResponse({
    required this.token,
  });

  factory PostAuthCustomerAuthProviderResponseSealedAuthResponse.fromJson(
    Map<String, dynamic> json,
  ) => _$PostAuthCustomerAuthProviderResponseSealedAuthResponseFromJson(json);

  @override
  Map<String, dynamic> toJson() =>
      _$PostAuthCustomerAuthProviderResponseSealedAuthResponseToJson(this);
}

@JsonSerializable()
class PostAuthCustomerAuthProviderResponseSealedAuthCallbackResponse
    extends PostAuthCustomerAuthProviderResponseSealed
    implements AuthCallbackResponse {
  @override
  final String location;

  const PostAuthCustomerAuthProviderResponseSealedAuthCallbackResponse({
    required this.location,
  });

  factory PostAuthCustomerAuthProviderResponseSealedAuthCallbackResponse.fromJson(
    Map<String, dynamic> json,
  ) => _$PostAuthCustomerAuthProviderResponseSealedAuthCallbackResponseFromJson(
    json,
  );

  @override
  Map<String, dynamic> toJson() =>
      _$PostAuthCustomerAuthProviderResponseSealedAuthCallbackResponseToJson(
        this,
      );
}
