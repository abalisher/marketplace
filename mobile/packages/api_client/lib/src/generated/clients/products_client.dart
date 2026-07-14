// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_product_list_response.dart';
import '../models/store_product_response.dart';

part 'products_client.g.dart';

@RestApi()
abstract class ProductsClient {
  factory ProductsClient(Dio dio, {String? baseUrl}) = _ProductsClient;

  /// List Products.
  ///
  /// Retrieve a list of products. The products can be filtered by fields such as `id`. The products can also be sorted or paginated.
  ///
  /// You can retrieve the content of the products translated to a specific locale either by passing the `locale` query parameter or by setting the `x-medusa-locale` header to the desired locale code in BCP 47 format. If you don't pass a locale, and your store has a default locale, the default locale will be used.
  ///
  /// With localization, the products' content like title and description will be in the specified locale if a translation is available,  and fallback to the original content otherwise. Learn more in the [Localization](#localization) section.
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
  /// [and] - Join query parameters with an AND condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [or] - Join query parameters with an OR condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [q] - Search term to filter the product's searchable properties.
  ///
  /// [title] - Filter by product titles.
  ///
  /// [handle] - Filter by product handles.
  ///
  /// [isGiftcard] - Whether the product is a gift card.
  ///
  /// [collectionId] - Filter by a collection's ID to retrieve the products in it.
  ///
  /// [tagId] - Filter by a tag's ID to retrieve the products in it.
  ///
  /// [typeId] - Filter by a type's ID to retrieve the products in it.
  ///
  /// [createdAt] - Filter by the product's creation date.
  ///
  /// [updatedAt] - Filter by the product's update date.
  ///
  /// [regionId] - The ID of the region the products are being viewed from. This is required if you're retrieving product variant prices with taxes.
  ///
  /// [province] - The lower-case ISO 3166-2 province code the products are being viewed from. This is useful to narrow down the tax context when calculating product variant prices with taxes.
  ///
  /// [variants] - Filter the products' variants.
  ///
  /// [countryCode] - The product's country code.
  ///
  /// [cartId] - The product's cart id.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/products')
  Future<StoreProductListResponse> getProducts({
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
    @Query('title') dynamic title,
    @Query('handle') dynamic handle,
    @Query('is_giftcard') bool? isGiftcard,
    @Query('collection_id') dynamic collectionId,
    @Query('tag_id') dynamic tagId,
    @Query('type_id') dynamic typeId,
    @Query('created_at') dynamic createdAt,
    @Query('updated_at') dynamic updatedAt,
    @Query('region_id') String? regionId,
    @Query('province') String? province,
    @Query('sales_channel_id') dynamic salesChannelId,
    @Query('category_id') dynamic categoryId,
    @Query('variants') dynamic variants,
    @Query('country_code') String? countryCode,
    @Query('cart_id') String? cartId,
    @Query('locale') String? locale,
    @Query('external_id') dynamic externalId,
    @Query('option_value_id') dynamic optionValueId,
    @Query('option_id') dynamic optionId,
  });

  /// Get a Product.
  ///
  /// Retrieve a product by its ID. You can expand the product's relations or select the fields that should be returned.
  ///
  /// You can retrieve the content of the product translated to a specific locale either by passing the `locale` query parameter or by setting the `x-medusa-locale` header to the desired locale code in BCP 47 format. If you don't pass a locale, and your store has a default locale, the default locale will be used.
  ///
  /// With localization, the product's content like title and description will be in the specified locale if a translation is available,  and fallback to the original content otherwise. Learn more in the [Localization](#localization) section.
  ///
  /// [id] - The product's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [regionId] - The ID of the region the product is being viewed from. This is required if you're retrieving product variant prices with taxes.
  ///
  /// [countryCode] - The country code the product is being viewed from. This is required if you're retrieving product variant prices with taxes.
  ///
  /// [province] - The lower-case ISO 3166-2 province code the product is being viewed from. This is useful to narrow down the tax context when calculating product variant prices with taxes.
  ///
  /// [cartId] - The ID of the customer's cart. If set, the cart's region and shipping address's country code and province are used instead of the `region_id`, `country_code`, and `province` properties.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/products/{id}')
  Future<StoreProductResponse> getProductsId({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('region_id') String? regionId,
    @Query('country_code') String? countryCode,
    @Query('province') String? province,
    @Query('cart_id') String? cartId,
    @Query('locale') String? locale,
  });
}
