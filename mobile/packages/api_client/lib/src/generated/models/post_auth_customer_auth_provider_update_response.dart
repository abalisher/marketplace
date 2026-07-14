// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'post_auth_customer_auth_provider_update_response.g.dart';

@JsonSerializable()
class PostAuthCustomerAuthProviderUpdateResponse {
  const PostAuthCustomerAuthProviderUpdateResponse({required this.success});

  factory PostAuthCustomerAuthProviderUpdateResponse.fromJson(
    Map<String, Object?> json,
  ) => _$PostAuthCustomerAuthProviderUpdateResponseFromJson(json);

  /// Whether the password was reset successfully.
  final bool success;

  Map<String, Object?> toJson() =>
      _$PostAuthCustomerAuthProviderUpdateResponseToJson(this);
}
