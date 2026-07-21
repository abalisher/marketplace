// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/admin_stock_location_list_response.dart';

part 'admin_stock_locations_client.g.dart';

@RestApi()
abstract class AdminStockLocationsClient {
  factory AdminStockLocationsClient(Dio dio, {String? baseUrl}) =
      _AdminStockLocationsClient;

  /// List Stock Locations.
  ///
  /// Retrieve a list of stock locations. The stock locations can be filtered by fields such as `id`. The stock locations can also be sorted or paginated.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [offset] - The number of items to skip when retrieving a list.
  ///
  /// [limit] - Limit the number of items returned in the list.
  ///
  /// [order] - The field to sort the data by. By default, the sort order is ascending. To change the order to descending, prefix the field name with `-`.
  ///
  /// [q] - Search term to filter the stock location's searchable properties.
  ///
  /// [createdAt] - Filter by a stock location's creation date.
  ///
  /// [updatedAt] - Filter by a stock location's update date.
  ///
  /// [deletedAt] - Filter by a stock location's deletion date.
  ///
  /// [withDeleted] - Whether to include deleted records in the result.
  @GET('/admin/stock-locations')
  Future<AdminStockLocationListResponse> adminGetStockLocations({
    @Query('fields') String? fields,
    @Query('offset') num? offset,
    @Query('limit') num? limit,
    @Query('order') String? order,
    @Query('q') String? q,
    @Query('id') dynamic id,
    @Query('name') dynamic name,
    @Query('address_id') dynamic addressId,
    @Query('sales_channel_id') dynamic salesChannelId,
    @Query('created_at') dynamic createdAt,
    @Query('updated_at') dynamic updatedAt,
    @Query('deleted_at') dynamic deletedAt,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('with_deleted') bool? withDeleted,
  });
}
