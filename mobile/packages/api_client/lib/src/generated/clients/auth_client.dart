// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/auth_customer_auth_provider_reset_password_request_body.dart';
import '../models/auth_customer_emailpass_verification_confirm_request_body.dart';
import '../models/auth_response.dart';
import '../models/auth_store_session_response.dart';
import '../models/delete_auth_session_response.dart';
import '../models/post_auth_customer_auth_provider_response_sealed.dart';
import '../models/post_auth_customer_auth_provider_update_response.dart';

part 'auth_client.g.dart';

@RestApi()
abstract class AuthClient {
  factory AuthClient(Dio dio, {String? baseUrl}) = _AuthClient;

  /// Verify the Customer's Email.
  ///
  /// Verifies the customer's email using a token that is typically sent to their email address. This is used to confirm the customer's email during registration or authentication when [email verification is required](https://docs.medusajs.com/resources/commerce-modules/auth/auth-providers/emailpass). You can listen to the `auth.verification_requested` event in a subscriber and send an email to the customer with the verification token.
  ///
  /// [body] - The details required to verify the customer's email.
  @POST('/auth/customer/emailpass/verification/confirm')
  Future<void> postActorTypeAuthProviderVerificationConfirm({
    @Body() required AuthCustomerEmailpassVerificationConfirmRequestBody body,
  });

  /// Authenticate Customer.
  ///
  /// Authenticate a customer and receive the JWT token to be used in the header of subsequent requests.
  ///
  /// When used with a third-party provider, such as Google, the request returns a `location` property. You redirect to the specified URL in your storefront to continue authentication with the third-party service.
  ///
  /// [authProvider] - The provider used for authentication.
  ///
  /// [body] - The input data necessary for authentication. .
  /// For example, for email-pass authentication, pass `email` and `password` properties. .
  /// For the Google and GitHub authentication providers, you can pass `callback_url` to indicate the URL in the frontend that the customer should be redirected to after completing their authentication. This will override the provider's `callbackUrl` configurations in `medusa-config.ts`.
  @POST('/auth/customer/{auth_provider}')
  Future<PostAuthCustomerAuthProviderResponseSealed> postActorTypeAuthProvider({
    @Path('auth_provider') required String authProvider,
    @Body() required dynamic body,
  });

  /// Validate Authentication Callback.
  ///
  /// This API route is used by your storefront or frontend application when a third-party provider redirects to it after authentication. It validates the authentication with the third-party provider and, if successful, returns an authentication token. All query parameters received from the third-party provider, such as `code`, `state`, and `error`, must be passed as query parameters to this route.
  /// You can decode the JWT token using libraries like [react-jwt](https://www.npmjs.com/package/react-jwt) in the storefront. If the decoded data doesn't  have an `actor_id` property, then you must register the customer using the Create Customer API route passing the token in the request's Authorization header.
  ///
  /// [authProvider] - The provider used for authentication.
  @POST('/auth/customer/{auth_provider}/callback')
  Future<AuthResponse> postActorTypeAuthProviderCallback({
    @Path('auth_provider') required String authProvider,
  });

  /// Retrieve Registration JWT Token.
  ///
  /// This API route retrieves a registration JWT token of a customer that hasn't been registered yet. The token is used in the header of requests that create a customer.
  ///
  /// [authProvider] - The provider used for authentication.
  ///
  /// [body] - The input data necessary for authentication. For example, for email-pass authentication, pass `email` and `password` properties.
  @POST('/auth/customer/{auth_provider}/register')
  Future<AuthResponse> postActorTypeAuthProviderRegister({
    @Path('auth_provider') required String authProvider,
    @Body() required dynamic body,
  });

  /// Generate Reset Password Token for Customer.
  ///
  /// Generate a reset password token for a customer. This API route doesn't reset the customer password or send them the reset instructions in a notification.
  ///
  /// Instead, This API route emits the `auth.password_reset` event, passing it the token as a payload. You can listen to that event in a subscriber as explained in [this guide](https://docs.medusajs.com/resources/commerce-modules/auth/reset-password), then send the customer a notification. The notification is sent using a [Notification Module Provider](https://docs.medusajs.com/resources/infrastructure-modules/notification), and it should have a URL that accepts a `token` query parameter, allowing the customer to reset their password from the storefront.
  ///
  ///
  ///  Use the generated token to update the customer's password using the [Reset Password API route](https://docs.medusajs.com/api/store#auth_postactor_typeauth_providerupdate).
  ///
  /// [authProvider] - The provider used for authentication.
  ///
  /// [body] - The input data necessary to generate a reset password token.
  @POST('/auth/customer/{auth_provider}/reset-password')
  Future<void> postActorTypeAuthProviderResetPassword({
    @Path('auth_provider') required String authProvider,
    @Body() required AuthCustomerAuthProviderResetPasswordRequestBody body,
  });

  /// Reset a Customer's Password.
  ///
  /// Reset a customer's password using a reset-password token generated with the [Generate Reset Password Token API route](https://docs.medusajs.com/api/store#auth_postactor_typeauth_providerresetpassword). You pass the token as a bearer token in the request's Authorization header.
  ///
  /// [authProvider] - The provider used for authentication.
  ///
  /// [body] - The input data necessary for authentication with the specified auth provider. For example, for email-pass authentication, pass `email` and `password` properties.
  @POST('/auth/customer/{auth_provider}/update')
  Future<PostAuthCustomerAuthProviderUpdateResponse>
  postActorTypeAuthProviderUpdate({
    @Path('auth_provider') required String authProvider,
    @Body() required dynamic body,
  });

  /// Set Authentication Session.
  ///
  /// Set the cookie session ID of a customer. The customer must be previously authenticated with the `/auth/customer/{provider}` API route first, as the JWT token is required in the header of the request.
  @POST('/auth/session')
  Future<AuthStoreSessionResponse> postSession();

  /// Delete Authentication Session.
  ///
  /// Deletes the cookie session ID previously set for authentication.
  @DELETE('/auth/session')
  Future<DeleteAuthSessionResponse> deleteSession();

  /// Refresh Authentication Token.
  ///
  /// Refresh the authentication token of a customer. This is useful after authenticating a customer with a third-party service to ensure the token holds the new user's details, or when you don't want customers to re-login every day.
  @POST('/auth/token/refresh')
  Future<AuthResponse> postAdminAuthTokenRefresh();
}
