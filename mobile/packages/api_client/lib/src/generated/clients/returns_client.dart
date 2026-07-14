// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_create_return.dart';
import '../models/store_return_response.dart';

part 'returns_client.g.dart';

@RestApi()
abstract class ReturnsClient {
  factory ReturnsClient(Dio dio, {String? baseUrl}) = _ReturnsClient;

  /// Create Return.
  ///
  /// Create a return for an order's items. The admin receives the return and process it from their side.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/returns')
  Future<StoreReturnResponse> postReturns({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCreateReturn body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('locale') String? locale,
  });
}
