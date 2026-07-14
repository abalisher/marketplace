// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_customer.dart';

part 'auth_store_session_response.g.dart';

/// The authenticated customer's details.
@JsonSerializable()
class AuthStoreSessionResponse {
  const AuthStoreSessionResponse({required this.user});

  factory AuthStoreSessionResponse.fromJson(Map<String, Object?> json) =>
      _$AuthStoreSessionResponseFromJson(json);

  /// The logged-in customer.
  final StoreCustomer user;

  Map<String, Object?> toJson() => _$AuthStoreSessionResponseToJson(this);
}
