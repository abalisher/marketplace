// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/get_store_collections_response.dart';
import '../models/store_collection_response.dart';

part 'collections_client.g.dart';

@RestApi()
abstract class CollectionsClient {
  factory CollectionsClient(Dio dio, {String? baseUrl}) = _CollectionsClient;

  /// List Collections.
  ///
  /// Retrieve a list of collections. The collections can be filtered by fields such as `handle`. The collections can also be sorted or paginated.
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
  /// [createdAt] - Filter by the collection's creation date.
  ///
  /// [updatedAt] - Filter by the collection's update date.
  ///
  /// [q] - Search term to filter the collection's searchable properties.
  ///
  /// [and] - Join query parameters with an AND condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [or] - Join query parameters with an OR condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [withDeleted] - Whether to include deleted records in the result.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/collections')
  Future<GetStoreCollectionsResponse> getCollections({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('offset') num? offset,
    @Query('limit') num? limit,
    @Query('order') String? order,
    @Query('title') dynamic title,
    @Query('created_at') dynamic createdAt,
    @Query('updated_at') dynamic updatedAt,
    @Query('handle') dynamic handle,
    @Query('q') String? q,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('with_deleted') bool? withDeleted,
    @Query('id') dynamic id,
    @Query('locale') String? locale,
    @Query('external_id') dynamic externalId,
  });

  /// Get a Collection.
  ///
  /// Retrieve a collection by its ID. You can expand the collection's relations or select the fields that should be returned.
  ///
  /// [id] - The collection's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/collections/{id}')
  Future<StoreCollectionResponse> getCollectionsId({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });
}
