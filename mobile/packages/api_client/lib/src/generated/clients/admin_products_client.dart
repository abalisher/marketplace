// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/admin_product_response.dart';
import '../models/get_admin_products_response.dart';

part 'admin_products_client.g.dart';

@RestApi()
abstract class AdminProductsClient {
  factory AdminProductsClient(Dio dio, {String? baseUrl}) =
      _AdminProductsClient;

  /// List Products.
  ///
  /// Retrieve a list of products. The products can be filtered by fields such as `id`. The products can also be sorted or paginated.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [offset] - The number of items to skip when retrieving a list.
  ///
  /// [limit] - Limit the number of items returned in the list.
  ///
  /// [order] - The field to sort the data by. By default, the sort order is ascending. To change the order to descending, prefix the field name with `-`.
  ///
  /// [q] - Search term to filter a product's searchable properties.
  ///
  /// [isGiftcard] - Filter by whether a product is a gift card.
  ///
  /// [createdAt] - Filter by a product's creation date.
  ///
  /// [updatedAt] - Filter by a product's update date.
  ///
  /// [deletedAt] - Filter by a product's deletion date.
  ///
  /// [and] - Join query parameters with an AND condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [or] - Join query parameters with an OR condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [variants] - Filter the retrieved products' variants.
  ///
  /// [withDeleted] - Whether to include deleted products.
  @GET('/admin/products')
  Future<GetAdminProductsResponse> adminGetProducts({
    @Query('fields') String? fields,
    @Query('offset') num? offset,
    @Query('limit') num? limit,
    @Query('order') String? order,
    @Query('price_list_id') dynamic priceListId,
    @Query('q') String? q,
    @Query('status') dynamic status,
    @Query('sales_channel_id') dynamic salesChannelId,
    @Query('title') dynamic title,
    @Query('handle') dynamic handle,
    @Query('id') dynamic id,
    @Query('is_giftcard') bool? isGiftcard,
    @Query('type_id') dynamic typeId,
    @Query('category_id') dynamic categoryId,
    @Query('created_at') dynamic createdAt,
    @Query('updated_at') dynamic updatedAt,
    @Query('deleted_at') dynamic deletedAt,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('collection_id') dynamic collectionId,
    @Query('variants') dynamic variants,
    @Query('with_deleted') bool? withDeleted,
    @Query('external_id') dynamic externalId,
    @Query('tag_id') dynamic tagId,
    @Query('option_id') dynamic optionId,
    @Query('option_value_id') dynamic optionValueId,
  });

  /// Get a Product.
  ///
  /// Retrieve a product by its ID. You can expand the product's relations or select the fields that should be returned.
  ///
  /// [id] - The product's ID.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  @GET('/admin/products/{id}')
  Future<AdminProductResponse> adminGetProductsId({
    @Path('id') required String id,
    @Query('fields') String? fields,
  });
}
