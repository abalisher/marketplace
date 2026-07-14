// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/auth_mfa_challenges_id_verify_request_body.dart';
import '../models/auth_mfa_factors_id_request_body.dart';
import '../models/auth_mfa_factors_id_verify_request_body.dart';
import '../models/auth_mfa_factors_request_body.dart';
import '../models/auth_mfa_recovery_codes_request_body.dart';

part 'multi_factor_authentication_mfa_factors_client.g.dart';

@RestApi()
abstract class MultiFactorAuthenticationMfaFactorsClient {
  factory MultiFactorAuthenticationMfaFactorsClient(
    Dio dio, {
    String? baseUrl,
  }) = _MultiFactorAuthenticationMfaFactorsClient;

  /// Verify a Multi-Factor Authentication (MFA) Challenge.
  ///
  /// Verify a multi-factor authentication (MFA) challenge issued during login. On success, this.
  /// completes the authentication flow and returns a JWT token that can be used to authenticate.
  /// subsequent requests.
  ///
  /// [id] - The MFA challenge's ID.
  ///
  /// [body] - The details required to verify the MFA challenge.
  @POST('/auth/mfa/challenges/{id}/verify')
  Future<void> postMfaChallengesIdVerify({
    @Path('id') required String id,
    @Body() required AuthMfaChallengesIdVerifyRequestBody body,
  });

  /// List Multifactor Authentication (MFA) Factors.
  ///
  /// Retrieve the list of multi-factor authentication (MFA) factors registered for the authenticated user,.
  /// including both pending (not yet verified) and enabled factors.
  @GET('/auth/mfa/factors')
  Future<void> getMfaFactors();

  /// Start Multi-Factor Authentication (MFA) Factor Enrollment.
  ///
  /// Start the enrollment of a new multi-factor authentication (MFA) factor for the authenticated.
  /// user. The response contains the factor along with provider-specific setup data (such as a.
  /// secret and an `otpauth_url` for TOTP) that can be used to display a QR code. The factor must.
  /// then be verified via the verify endpoint before it can be used.
  ///
  /// [body] - The details of the MFA factor to enroll.
  @POST('/auth/mfa/factors')
  Future<void> postMfaFactors({
    @Body() required AuthMfaFactorsRequestBody body,
  });

  /// Disable a Multi-Factor Authentication (MFA) Factor.
  ///
  /// Disable a multi-factor authentication (MFA) factor for the authenticated user. Once disabled,.
  /// the factor can no longer be used to verify MFA challenges. When disabling a recovery-code.
  /// factor, a valid recovery code must be provided in the request body.
  ///
  /// [id] - The MFA factor's ID.
  ///
  /// [body] - The details required to disable the MFA factor.
  @DELETE('/auth/mfa/factors/{id}')
  Future<void> deleteMfaFactorsId({
    @Path('id') required String id,
    @Body() required AuthMfaFactorsIdRequestBody body,
  });

  /// Verify and Enable a Multi-Factor Authentication (MFA) Factor.
  ///
  /// Verify a pending multi-factor authentication (MFA) factor by submitting a code generated from.
  /// it. A successful verification enables the factor, after which it can be used to verify MFA.
  /// challenges during login.
  ///
  /// [id] - The MFA factor's ID.
  ///
  /// [body] - The details required to verify and enable the MFA factor.
  @POST('/auth/mfa/factors/{id}/verify')
  Future<void> postMfaFactorsIdVerify({
    @Path('id') required String id,
    @Body() required AuthMfaFactorsIdVerifyRequestBody body,
  });

  /// Generate Multi-Factor Authentication (MFA) Recovery Codes.
  ///
  /// Generate a new set of single-use recovery codes for the authenticated user. Recovery codes can.
  /// be used to verify MFA challenges when the user does not have access to their primary MFA.
  /// factor. Generating new codes replaces any previously issued codes, so they should be stored in.
  /// a safe place. At least one enabled MFA factor is required to generate recovery codes.
  ///
  /// [body] - The options to use when generating recovery codes.
  @POST('/auth/mfa/recovery-codes')
  Future<void> postMfaRecoveryCodes({
    @Body() required AuthMfaRecoveryCodesRequestBody body,
  });
}
