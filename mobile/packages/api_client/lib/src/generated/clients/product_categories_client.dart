// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_product_category_list_response.dart';
import '../models/store_product_category_response.dart';

part 'product_categories_client.g.dart';

@RestApi()
abstract class ProductCategoriesClient {
  factory ProductCategoriesClient(Dio dio, {String? baseUrl}) =
      _ProductCategoriesClient;

  /// List Product Categories.
  ///
  /// Retrieve a list of product categories. The product categories can be filtered by fields such as `id`. The product categories can also be sorted or paginated.
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
  /// [q] - Search term to filter the product category's properties.
  ///
  /// [includeAncestorsTree] - Whether to retrieve the category's parent. If you enable this, add to the `fields` query parameter `parent_category` to set the parent of a category in this field. You can either pass `*parent_category` to retreieve the fields of all parent categories, or select specific fields to make the response size smaller. For example, `fields=parent_category.id,parent_category.name`.
  ///
  /// [includeDescendantsTree] - Whether to retrieve a list of child categories. If you enable this, add to the `fields` query parameter `category_children` to set the child of a category in this field. You can either pass `*category_children` to retreieve the fields of all child categories, or select specific fields to make the response size smaller. For example, `fields=category_children.id,category_children.name`.
  ///
  /// [createdAt] - Filter by the category's creation date.
  ///
  /// [updatedAt] - Filter by the category's update date.
  ///
  /// [withDeleted] - Whether to include deleted records in the result.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/product-categories')
  Future<StoreProductCategoryListResponse> getProductCategories({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('offset') num? offset,
    @Query('limit') num? limit,
    @Query('order') String? order,
    @Query('q') String? q,
    @Query('id') dynamic id,
    @Query('description') dynamic description,
    @Query('handle') dynamic handle,
    @Query('parent_category_id') dynamic parentCategoryId,
    @Query('include_ancestors_tree') bool? includeAncestorsTree,
    @Query('include_descendants_tree') bool? includeDescendantsTree,
    @Query('created_at') dynamic createdAt,
    @Query('updated_at') dynamic updatedAt,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('name') dynamic name,
    @Query('with_deleted') bool? withDeleted,
    @Query('locale') String? locale,
    @Query('external_id') dynamic externalId,
  });

  /// Get a Product Category.
  ///
  /// Retrieve a product category by its ID. You can expand the product category's relations or select the fields that should be returned.
  ///
  /// [id] - The product category's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [includeAncestorsTree] - Whether to retrieve the category's parent. If you enable this, add to the `fields` query parameter `parent_category` to set the parent of a category in this field. You can either pass `*parent_category` to retreieve the fields of all parent categories, or select specific fields to make the response size smaller. For example, `fields=parent_category.id,parent_category.name`.
  ///
  /// [includeDescendantsTree] - Whether to retrieve a list of child categories. If you enable this, add to the `fields` query parameter `category_children` to set the children of a category in this field. You can either pass `*category_children` to retreieve the fields of all child categories, or select specific fields to make the response size smaller. For example, `fields=category_children.id,category_children.name`.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/product-categories/{id}')
  Future<StoreProductCategoryResponse> getProductCategoriesId({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('include_ancestors_tree') bool? includeAncestorsTree,
    @Query('include_descendants_tree') bool? includeDescendantsTree,
    @Query('locale') String? locale,
  });
}
