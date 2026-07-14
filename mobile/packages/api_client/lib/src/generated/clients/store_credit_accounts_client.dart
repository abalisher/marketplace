// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_claim_store_credit_account_params.dart';
import '../models/store_claim_store_credit_account_response.dart';
import '../models/store_store_credit_account_response.dart';
import '../models/store_store_credit_accounts_response.dart';

part 'store_credit_accounts_client.g.dart';

@RestApi()
abstract class StoreCreditAccountsClient {
  factory StoreCreditAccountsClient(Dio dio, {String? baseUrl}) =
      _StoreCreditAccountsClient;

  /// List Customer's Store Credit Accounts.
  ///
  /// Retrieve the logged-in customer's store credit accounts. The store credit accounts can be filtered by fields such as `id`. The store credit accounts can also be sorted or paginated.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [currencyCode] - Filter by the store credit account's currency code.
  ///
  /// [createdAt] - Filter by a store credit account's creation date.
  ///
  /// [updatedAt] - Filter by a store credit account's update date.
  ///
  /// [limit] - Limit the number of items returned in the list.
  ///
  /// [offset] - The number of items to skip when retrieving a list.
  ///
  /// [order] - The field to sort the data by. By default, the sort order is ascending. To change the order to descending, prefix the field name with `-`.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. If a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. Without prefix it will replace the entire default fields.
  ///
  /// [and] - Join query parameters with an AND condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [or] - Join query parameters with an OR condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [withDeleted] - Whether to include deleted records in the result.
  @GET('/store/store-credit-accounts')
  Future<StoreStoreCreditAccountsResponse> getStoreCreditAccounts({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('currency_code') String? currencyCode,
    @Query('created_at') dynamic createdAt,
    @Query('updated_at') dynamic updatedAt,
    @Query('limit') num? limit,
    @Query('offset') num? offset,
    @Query('order') String? order,
    @Query('fields') String? fields,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('locale') String? locale,
    @Query('with_deleted') bool? withDeleted,
  });

  /// Claim a Store Credit Account.
  ///
  /// Claim a store credit account as the logged-in customer. The store credit account must not belong to another customer, and it must have amount available to claim. This is typically used to claim anonymous store credit accounts, such as those created for guest users or through gift cards.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/store-credit-accounts/claim')
  Future<StoreClaimStoreCreditAccountResponse> postStoreCreditAccountsClaim({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreClaimStoreCreditAccountParams body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('locale') String? locale,
  });

  /// Get Customer's Store Credit Account.
  ///
  /// Retrieve logged-in customer's store credit account by its ID. You can expand the store credit account's relations or select the fields that should be returned.
  ///
  /// [id] - The store credit account's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/store-credit-accounts/{id}')
  Future<StoreStoreCreditAccountResponse> getStoreCreditAccountsId({
    @Path('id') required String id,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('locale') String? locale,
  });
}
