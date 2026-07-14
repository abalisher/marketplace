// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_product_tag_list_response.dart';
import '../models/store_product_tag_response.dart';

part 'product_tags_client.g.dart';

@RestApi()
abstract class ProductTagsClient {
  factory ProductTagsClient(Dio dio, {String? baseUrl}) = _ProductTagsClient;

  /// List Product Tags.
  ///
  /// Retrieve a list of product tags. The product tags can be filtered by fields such as `id`. The product tags can also be sorted or paginated.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data.
  /// if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields.
  /// without prefix it will replace the entire default fields.
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
  /// [q] - Query to search product tag's searchable fields.
  ///
  /// [createdAt] - Filter by the tag's creation date.
  ///
  /// [updatedAt] - Filter by the tag's update date.
  ///
  /// [withDeleted] - Whether to include deleted records in the result.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/product-tags')
  Future<StoreProductTagListResponse> getProductTags({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('offset') num? offset,
    @Query('limit') num? limit,
    @Query('order') String? order,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('q') String? q,
    @Query('id') dynamic id,
    @Query('value') dynamic value_,
    @Query('created_at') dynamic createdAt,
    @Query('updated_at') dynamic updatedAt,
    @Query('with_deleted') bool? withDeleted,
    @Query('locale') String? locale,
    @Query('external_id') dynamic externalId,
  });

  /// Get a Product Tag.
  ///
  /// Retrieve a product tag by its ID. You can expand the product tag's relations or select the fields that should be returned.
  ///
  /// [id] - The product tag's ID.
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
  @GET('/store/product-tags/{id}')
  Future<StoreProductTagResponse> getProductTagsId({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });
}
