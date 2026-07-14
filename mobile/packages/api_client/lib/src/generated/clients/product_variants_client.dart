// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/get_store_product_variants_response.dart';

part 'product_variants_client.g.dart';

@RestApi()
abstract class ProductVariantsClient {
  factory ProductVariantsClient(Dio dio, {String? baseUrl}) =
      _ProductVariantsClient;

  /// List Product Variants.
  ///
  /// Retrieve a list of product variants. The product variants can be filtered by fields such as `id`. The product variants can also be sorted or paginated.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [manageInventory] - Filter by whether Medusa manages inventory for the product variant.
  ///
  /// [allowBackorder] - Filter by whether backorders are allowed for the product variant.
  ///
  /// [q] - Query to search variants by their searchable fields.
  ///
  /// [options] - Filter by the product variant's options.
  ///
  /// [createdAt] - Filter by the product variant's creation date.
  ///
  /// [updatedAt] - Filter by the product variant's last update date.
  ///
  /// [deletedAt] - Filter by the product variant's deletion date.
  ///
  /// [limit] - Limit the number of items returned in the list.
  ///
  /// [offset] - The number of items to skip when retrieving a list.
  ///
  /// [order] - The field to sort the data by. By default, the sort order is ascending. To change the order to descending, prefix the field name with `-`.
  ///
  /// [withDeleted] - The product variant's with deleted.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. If a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. Without prefix it will replace the entire default fields.
  ///
  /// [and] - Join query parameters with an AND condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [or] - Join query parameters with an OR condition. Each object's content is the same type as the expected query parameters.
  @GET('/store/product-variants')
  Future<GetStoreProductVariantsResponse> getProductVariants({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('locale') String? locale,
    @Query('sku') dynamic sku,
    @Query('manage_inventory') bool? manageInventory,
    @Query('allow_backorder') bool? allowBackorder,
    @Query('product_id') dynamic productId,
    @Query('q') String? q,
    @Query('id') dynamic id,
    @Query('options') dynamic options,
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
  });
}
