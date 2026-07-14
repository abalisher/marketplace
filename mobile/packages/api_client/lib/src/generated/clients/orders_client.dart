// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/get_store_orders_response.dart';
import '../models/store_accept_order_transfer.dart';
import '../models/store_decline_order_transfer.dart';
import '../models/store_order_response.dart';
import '../models/store_request_order_transfer.dart';

part 'orders_client.g.dart';

@RestApi()
abstract class OrdersClient {
  factory OrdersClient(Dio dio, {String? baseUrl}) = _OrdersClient;

  /// List Logged-in Customer's Orders.
  ///
  /// Retrieve the orders of the logged-in customer. The orders can be filtered by fields such as `id`. The orders can also be sorted or paginated.
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
  /// [withDeleted] - Whether to include deleted records in the result.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/orders')
  Future<GetStoreOrdersResponse> getOrders({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('offset') num? offset,
    @Query('limit') num? limit,
    @Query('order') String? order,
    @Query('id') dynamic id,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('status') dynamic status,
    @Query('with_deleted') bool? withDeleted,
    @Query('locale') String? locale,
  });

  /// Get an Order.
  ///
  /// Retrieve an order by its ID. You can expand the order's relations or select the fields that should be returned.
  ///
  /// [id] - The order's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/orders/{id}')
  Future<StoreOrderResponse> getOrdersId({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Accept Order Transfer.
  ///
  /// Accept an order to be transfered to a customer's account, which was specified when the transfer request was created. The transfer is requested previously either by the customer using the [Request Order Transfer Store API route](https://docs.medusajs.com/api/store#orders_postordersidtransferrequest), or by the admin using the [Request Order Transfer Admin API route](https://docs.medusajs.com/api/admin#orders_postordersidtransferrequest).
  ///
  /// [id] - The order's ID.
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
  @POST('/store/orders/{id}/transfer/accept')
  Future<StoreOrderResponse> postOrdersIdTransferAccept({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreAcceptOrderTransfer body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Cancel Order Transfer.
  ///
  /// Cancel an order transfer that the logged-in customer previously requested using the [Request Order Transfer](https://docs.medusajs.com/api/store#orders_postordersidtransferrequest) API route.
  ///
  /// [id] - The order's ID.
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
  @POST('/store/orders/{id}/transfer/cancel')
  Future<StoreOrderResponse> postOrdersIdTransferCancel({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Decline Order Transfer.
  ///
  /// Decline an order transfer previously requested, typically by the admin user using the [Request Order Transfer Admin API route](https://docs.medusajs.com/api/admin#orders_postordersidtransferrequest).
  ///
  /// [id] - The order's ID.
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
  @POST('/store/orders/{id}/transfer/decline')
  Future<StoreOrderResponse> postOrdersIdTransferDecline({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreDeclineOrderTransfer body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Request Order Transfer.
  ///
  /// Request an order to be transfered to the logged-in customer's account. The transfer is confirmed using the [Accept Order Transfer](https://docs.medusajs.com/api/store#orders_postordersidtransferaccept) API route.
  ///
  /// [id] - The order's ID.
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
  @POST('/store/orders/{id}/transfer/request')
  Future<StoreOrderResponse> postOrdersIdTransferRequest({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreRequestOrderTransfer body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });
}
