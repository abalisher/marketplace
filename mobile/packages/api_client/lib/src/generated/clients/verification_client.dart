// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/auth_verification_confirm_request_body.dart';
import '../models/auth_verification_request_request_body.dart';

part 'verification_client.g.dart';

@RestApi()
abstract class VerificationClient {
  factory VerificationClient(Dio dio, {String? baseUrl}) = _VerificationClient;

  /// Confirm Customer Verification.
  ///
  /// Confirm a verification token of the customer. This API route is used as the last step part of the email verification flow. It can also be used for custom flows, such as phone number verification. Once successfully verified, a customer can complete their registration and log into their account.
  ///
  /// [body] - The verification details.
  @POST('/auth/verification/confirm')
  Future<void> postVerificationConfirm({
    @Body() required AuthVerificationConfirmRequestBody body,
  });

  /// Request Customer Verification.
  ///
  /// Create a verification request for a customer. This API route is used when a customer logs in, but their email requires verification. It can also be used for custom flows, such as phone number verification. Once successfully requested, a verification code will be generated and an `auth.verification_requested` event will be emitted. You can listen to this event and decide how to deliver the code to the customer.
  ///
  /// [body] - The verification request details.
  @POST('/auth/verification/request')
  Future<void> postVerificationRequest({
    @Body() required AuthVerificationRequestRequestBody body,
  });
}
