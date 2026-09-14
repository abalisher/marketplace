// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_shipping_option_list_response.dart';
import '../models/store_shipping_option_response.dart';
import '../models/store_shipping_options_id_calculate_request_body.dart';

part 'shipping_options_client.g.dart';

@RestApi()
abstract class ShippingOptionsClient {
  factory ShippingOptionsClient(Dio dio, {String? baseUrl}) =
      _ShippingOptionsClient;

  /// List Shipping Options for Cart.
  ///
  /// Retrieve a list of shipping options for a cart. The cart's ID is set in the required `cart_id` query parameter.
  ///
  /// The shipping options also be sorted or paginated.
  ///
  /// For a shipping option whose `price_type` is `calculated`, the returned `amount` isn't reliable, as its price is computed on the fly by the fulfillment provider. To retrieve its price, use the [Calculate Shipping Option Price API route](https://docs.medusajs.com/api/store#shipping-options_postshippingoptionsidcalculate).
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [offset] - The number of items to skip when retrieving a list.
  ///
  /// [limit] - Limit the number of items returned in the list.
  ///
  /// [order] - The field to sort the data by. By default, the sort order is ascending. To change the order to descending, prefix the field name with `-`.
  ///
  /// [cartId] - The ID of the cart to retrieve its shipping options.
  ///
  /// [and] - Join query parameters with an AND condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [or] - Join query parameters with an OR condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [isReturn] - Whether the shipping option can be used for returns.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/shipping-options')
  Future<StoreShippingOptionListResponse> getShippingOptions({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Query('cart_id') required String cartId,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('offset') num? offset,
    @Query('limit') num? limit,
    @Query('order') String? order,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('is_return') bool? isReturn,
    @Query('locale') String? locale,
  });

  /// Calculate Shipping Option Price.
  ///
  /// Calculate the price of a shipping option in a cart. Use this API route for shipping options whose `price_type` is `calculated`, as their price isn't stored but computed on the fly by the associated fulfillment provider against the cart.
  ///
  /// If the fulfillment provider fails to calculate the price, this route returns an error.
  ///
  /// [id] - The shipping option's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. If a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. Without prefix it will replace the entire default fields.
  ///
  /// [body] - The calculation's details.
  @POST('/store/shipping-options/{id}/calculate')
  Future<StoreShippingOptionResponse> postShippingOptionsIdCalculate({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreShippingOptionsIdCalculateRequestBody body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('locale') String? locale,
    @Query('fields') String? fields,
  });
}
