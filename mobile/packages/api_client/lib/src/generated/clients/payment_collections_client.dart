// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_create_payment_collection.dart';
import '../models/store_initialize_payment_session.dart';
import '../models/store_payment_collection_response.dart';

part 'payment_collections_client.g.dart';

@RestApi()
abstract class PaymentCollectionsClient {
  factory PaymentCollectionsClient(Dio dio, {String? baseUrl}) =
      _PaymentCollectionsClient;

  /// Create Payment Collection.
  ///
  /// Create a payment collection for a cart. This is used during checkout, where the payment collection holds the cart's payment sessions.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/payment-collections')
  Future<StorePaymentCollectionResponse> postPaymentCollections({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCreatePaymentCollection body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Initialize Payment Session of a Payment Collection.
  ///
  /// Initialize and add a payment session to a payment collection. This is used during checkout, where you create a payment collection for the cart, then initialize a payment session for the payment provider that the customer chooses.
  /// It's highly recommended to have an amount greater than `0` in the payment collection, as some payment providers, such as Stripe, require a non-zero amount to create a payment session. Otherwise, an error will be thrown on the payment provider's side.
  /// In cases where you want to create a payment session for a payment collection with an amount of `0`, you can use the Manual System Payment Provider instead of third-party payment providers. The Manual System Payment Provider is built into Medusa and allows you to create payment sessions without interacting with an external payment provider.
  /// Make sure to configure the Manual System Payment Provider in your store's region. Learn more in the [Manage Region](https://docs.medusajs.com/user-guide/settings/regions#edit-region-details) user guide.
  ///
  /// [id] - The payment collection's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/payment-collections/{id}/payment-sessions')
  Future<StorePaymentCollectionResponse>
  postPaymentCollectionsIdPaymentSessions({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreInitializePaymentSession body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });
}
