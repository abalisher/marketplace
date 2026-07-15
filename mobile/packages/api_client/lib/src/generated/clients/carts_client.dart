// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/delete_store_carts_id_line_items_line_id_response.dart';
import '../models/delete_store_carts_id_promotions_response.dart';
import '../models/post_store_carts_id_complete_response_sealed.dart';
import '../models/post_store_carts_id_response.dart';
import '../models/store_add_gift_card_to_cart.dart';
import '../models/store_add_store_credits_to_cart.dart';
import '../models/store_cart_add_promotion.dart';
import '../models/store_cart_remove_promotion.dart';
import '../models/store_cart_response.dart';
import '../models/store_carts_id_customer_request_body.dart';
import '../models/store_carts_id_line_items_line_id_request_body.dart';
import '../models/store_carts_id_line_items_request_body.dart';
import '../models/store_carts_id_request_body.dart';
import '../models/store_carts_request_body.dart';
import '../models/store_remove_gift_card_from_cart.dart';

part 'carts_client.g.dart';

@RestApi()
abstract class CartsClient {
  factory CartsClient(Dio dio, {String? baseUrl}) = _CartsClient;

  /// Create Cart.
  ///
  /// Create a cart.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [body] - The cart's details.
  @POST('/store/carts')
  Future<StoreCartResponse> postCarts({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCartsRequestBody body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Get a Cart.
  ///
  /// Retrieve a cart by its ID. You can expand the cart's relations or select the fields that should be returned.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/carts/{id}')
  Future<StoreCartResponse> getCartsId({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Update a Cart.
  ///
  /// Update a cart's details. This unsets the payment methods chosen before, and the customer would have to choose them again. Also, if the customer has chosen a shipping method whose option isn't valid for the cart's shipping address anymore, the shipping method will be unset. For example, if the shipping option is valid only in the US geo zone, and the shipping address's country code is `DE`, the shipping method will be unset.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [body] - The properties to update in the cart item.
  @POST('/store/carts/{id}')
  Future<PostStoreCartsIdResponse> postCartsId({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCartsIdRequestBody body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Complete Cart.
  ///
  /// Complete a cart and place an order.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/carts/{id}/complete')
  Future<PostStoreCartsIdCompleteResponseSealed> postCartsIdComplete({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Change Cart's Customer to Logged-in Customer.
  ///
  /// Change the cart's customer to the currently logged-in customer. This is useful when you create the cart for a guest customer, then they log in with their account.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data.
  /// if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields.
  /// without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [body] - Optional additional data to pass to the underlying workflow.
  @POST('/store/carts/{id}/customer')
  Future<StoreCartResponse> postCartsIdCustomer({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCartsIdCustomerRequestBody body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Add Gift Card to Cart.
  ///
  /// Add a Gift Card to a cart.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/carts/{id}/gift-cards')
  Future<StoreCartResponse> postCartsIdGiftCards({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreAddGiftCardToCart body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('locale') String? locale,
  });

  /// Remove Gift Card from Cart.
  ///
  /// Remove a Gift Card from a cart.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @DELETE('/store/carts/{id}/gift-cards')
  Future<StoreCartResponse> deleteCartsIdGiftCards({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreRemoveGiftCardFromCart body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('locale') String? locale,
  });

  /// Add Line Item to Cart.
  ///
  /// Add a product variant as a line item in the cart.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [body] - The details of the line item to add.
  @POST('/store/carts/{id}/line-items')
  Future<StoreCartResponse> postCartsIdLineItems({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCartsIdLineItemsRequestBody body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Update a Line Item in a Cart.
  ///
  /// Update a line item's details in the cart.
  ///
  /// [id] - The cart's ID.
  ///
  /// [lineId] - The line item's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [body] - The details to update in the line item.
  @POST('/store/carts/{id}/line-items/{line_id}')
  Future<StoreCartResponse> postCartsIdLineItemsLineId({
    @Path('id') required String id,
    @Path('line_id') required String lineId,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCartsIdLineItemsLineIdRequestBody body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Remove Line Item from Cart.
  ///
  /// Remove a line item from a cart.
  ///
  /// [id] - The cart's ID.
  ///
  /// [lineId] - The line item's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @DELETE('/store/carts/{id}/line-items/{line_id}')
  Future<DeleteStoreCartsIdLineItemsLineIdResponse>
  deleteCartsIdLineItemsLineId({
    @Path('id') required String id,
    @Path('line_id') required String lineId,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Add Promotions to Cart.
  ///
  /// Add a list of promotions to a cart.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/carts/{id}/promotions')
  Future<StoreCartResponse> postCartsIdPromotions({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCartAddPromotion body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Remove Promotions from Cart.
  ///
  /// Remove a list of promotions from a cart.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @DELETE('/store/carts/{id}/promotions')
  Future<DeleteStoreCartsIdPromotionsResponse> deleteCartsIdPromotions({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCartRemovePromotion body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Add Shipping Method to Cart.
  ///
  /// Add a shipping method to a cart. Use this API route when the customer chooses their preferred shipping option.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [body] - The shipping method's details.
  @POST('/store/carts/{id}/shipping-methods')
  Future<StoreCartResponse> postCartsIdShippingMethods({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required dynamic body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Add Store Credit to Cart.
  ///
  /// Add a Store Credit to a cart.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/carts/{id}/store-credits')
  Future<StoreCartResponse> postCartsIdStoreCredits({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreAddStoreCreditsToCart body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('locale') String? locale,
  });

  /// Calculate Cart Taxes.
  ///
  /// Calculate the cart's tax lines and amounts.
  ///
  /// Medusa recalculates a cart's tax lines automatically on cart changes when the cart's region has `automatic_taxes` enabled, so you typically don't need to use this route. Use this route to force a recalculation, such as when `automatic_taxes` is disabled, which also triggers a fresh calculation from your third-party tax provider, if you use one.
  ///
  /// [id] - The cart's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/carts/{id}/taxes')
  Future<StoreCartResponse> postCartsIdTaxes({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });
}
