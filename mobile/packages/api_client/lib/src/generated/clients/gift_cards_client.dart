// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'gift_cards_client.g.dart';

@RestApi()
abstract class GiftCardsClient {
  factory GiftCardsClient(Dio dio, {String? baseUrl}) = _GiftCardsClient;

  /// Get a Gift Card.
  ///
  /// Retrieve a gift card by its ID or code. You can expand the gift card's relations or select the fields that should be returned.
  ///
  /// [idOrCode] - The gift card's ID or code.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data.
  ///  if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields.
  ///  without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/gift-cards/{idOrCode}')
  Future<void> getGiftCardsIdorcode({
    @Path('idOrCode') required String idOrCode,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });
}
