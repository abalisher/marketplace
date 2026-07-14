// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'auth_customer_emailpass_verification_confirm_request_body.g.dart';

@JsonSerializable()
class AuthCustomerEmailpassVerificationConfirmRequestBody {
  const AuthCustomerEmailpassVerificationConfirmRequestBody({
    required this.token,
  });

  factory AuthCustomerEmailpassVerificationConfirmRequestBody.fromJson(
    Map<String, Object?> json,
  ) => _$AuthCustomerEmailpassVerificationConfirmRequestBodyFromJson(json);

  /// The verification token sent to the customer's email address.
  final String token;

  Map<String, Object?> toJson() =>
      _$AuthCustomerEmailpassVerificationConfirmRequestBodyToJson(this);
}
