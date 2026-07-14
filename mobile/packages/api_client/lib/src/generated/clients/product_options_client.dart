// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/get_store_product_options_response.dart';
import '../models/store_product_option_response.dart';

part 'product_options_client.g.dart';

@RestApi()
abstract class ProductOptionsClient {
  factory ProductOptionsClient(Dio dio, {String? baseUrl}) =
      _ProductOptionsClient;

  /// List Product Options.
  ///
  /// Retrieve a list of product options. The product options can be filtered by fields such as `id`. The product options can also be sorted or paginated.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [q] - A search term to filter the product option's searchable fields.
  ///
  /// [isExclusive] - Filter by whether the product option is exclusive to a product or global.
  ///
  /// [createdAt] - Filter by a product option's creation date.
  ///
  /// [updatedAt] - Filter by a product option's update date.
  ///
  /// [deletedAt] - Filter by a product option's deletion date.
  ///
  /// [limit] - Limit the number of items returned in the list.
  ///
  /// [offset] - The number of items to skip when retrieving a list.
  ///
  /// [order] - The field to sort the data by. By default, the sort order is ascending. To change the order to descending, prefix the field name with `-`.
  ///
  /// [withDeleted] - The product option's with deleted.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. If a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. Without prefix it will replace the entire default fields.
  ///
  /// [and] - Join query parameters with an AND condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [or] - Join query parameters with an OR condition. Each object's content is the same type as the expected query parameters.
  @GET('/store/product-options')
  Future<GetStoreProductOptionsResponse> getProductOptions({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('locale') String? locale,
    @Query('q') String? q,
    @Query('title') dynamic title,
    @Query('is_exclusive') bool? isExclusive,
    @Query('created_at') dynamic createdAt,
    @Query('updated_at') dynamic updatedAt,
    @Query('deleted_at') dynamic deletedAt,
    @Query('limit') num? limit,
    @Query('offset') num? offset,
    @Query('order') String? order,
    @Query('with_deleted') bool? withDeleted,
    @Query('fields') String? fields,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('id') dynamic id,
  });

  /// Get a Product Option.
  ///
  /// Retrieve a product option by its ID. You can expand the product option's relations or select the fields that should be returned.
  ///
  /// [id] - The product option's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. If a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. Without prefix it will replace the entire default fields.
  @GET('/store/product-options/{id}')
  Future<StoreProductOptionResponse> getProductOptionsId({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('locale') String? locale,
    @Query('fields') String? fields,
  });
}
