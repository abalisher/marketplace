// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_locale_list_response.dart';

part 'locales_client.g.dart';

@RestApi()
abstract class LocalesClient {
  factory LocalesClient(Dio dio, {String? baseUrl}) = _LocalesClient;

  /// List Locales.
  ///
  /// Retrieve the list of supported locales. You can use this list to allow customers to select their preferred locale in your storefront.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/locales')
  Future<StoreLocaleListResponse> getLocales({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('locale') String? locale,
  });
}
