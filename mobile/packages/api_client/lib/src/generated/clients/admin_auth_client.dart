// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/post_auth_user_auth_provider_response_sealed.dart';

part 'admin_auth_client.g.dart';

@RestApi()
abstract class AdminAuthClient {
  factory AdminAuthClient(Dio dio, {String? baseUrl}) = _AdminAuthClient;

  /// Authenticate User.
  ///
  /// Authenticate a user and receive the JWT token to be used in the header of subsequent requests.
  ///
  /// When used with a third-party provider, such as Google, the request returns a `location` property. You redirect to the specified URL in your frontend to continue authentication with the third-party service.
  ///
  /// [authProvider] - The provider used for authentication.
  ///
  /// [body] - The input data necessary for authentication. .
  /// For example, for email-pass authentication, pass `email` and `password` properties. .
  /// For the Google and GitHub authentication providers, you can pass `callback_url` to indicate the URL in the frontend that the user should be redirected to after completing their authentication. This will override the provider's `callbackUrl` configurations in `medusa-config.ts`.
  @POST('/auth/user/{auth_provider}')
  Future<PostAuthUserAuthProviderResponseSealed>
  adminPostActorTypeAuthProvider({
    @Path('auth_provider') required String authProvider,
    @Body() required dynamic body,
  });
}
