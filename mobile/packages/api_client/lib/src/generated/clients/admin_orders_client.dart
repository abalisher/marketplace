// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/admin_order_response.dart';
import '../models/get_admin_orders_response.dart';

part 'admin_orders_client.g.dart';

@RestApi()
abstract class AdminOrdersClient {
  factory AdminOrdersClient(Dio dio, {String? baseUrl}) = _AdminOrdersClient;

  /// List Orders.
  ///
  /// Retrieve a list of orders. The orders can be filtered by fields such as `id`. The orders can also be sorted or paginated.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [offset] - The number of items to skip when retrieving a list.
  ///
  /// [limit] - Limit the number of items returned in the list.
  ///
  /// [order] - The field to sort the data by. By default, the sort order is ascending. To change the order to descending, prefix the field name with `-`.
  ///
  /// [and] - Join query parameters with an AND condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [or] - Join query parameters with an OR condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [salesChannelId] - Filter by sales channel IDs to retrieve the orders associated with them.
  ///
  /// [regionId] - Filter by region IDs to retrieve their associated orders.
  ///
  /// [q] - Search term to filter the order's searchable properties.
  ///
  /// [createdAt] - Filter by the order's creation date.
  ///
  /// [updatedAt] - Filter by the order's update date.
  ///
  /// [withDeleted] - Whether to include deleted records in the result.
  @GET('/admin/orders')
  Future<GetAdminOrdersResponse> adminGetOrders({
    @Query('fields') String? fields,
    @Query('offset') num? offset,
    @Query('limit') num? limit,
    @Query('order') String? order,
    @Query('id') dynamic id,
    @Query('status') dynamic status,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('sales_channel_id') List<String>? salesChannelId,
    @Query('region_id') dynamic regionId,
    @Query('q') String? q,
    @Query('created_at') dynamic createdAt,
    @Query('updated_at') dynamic updatedAt,
    @Query('customer_id') dynamic customerId,
    @Query('with_deleted') bool? withDeleted,
  });

  /// Get an Order.
  ///
  /// Retrieve an order by its ID. You can expand the order's relations or select the fields that should be returned.
  ///
  /// [id] - The order's ID.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [version] - The order's version.
  @GET('/admin/orders/{id}')
  Future<AdminOrderResponse> adminGetOrdersId({
    @Path('id') required String id,
    @Query('fields') String? fields,
    @Query('version') num? version,
  });
}
