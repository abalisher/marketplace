// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/delete_store_customers_me_addresses_address_id_response.dart';
import '../models/store_create_customer.dart';
import '../models/store_create_customer_address.dart';
import '../models/store_customer_address_list_response.dart';
import '../models/store_customer_address_response.dart';
import '../models/store_customer_response.dart';
import '../models/store_update_customer.dart';
import '../models/store_update_customer_address.dart';

part 'customers_client.g.dart';

@RestApi()
abstract class CustomersClient {
  factory CustomersClient(Dio dio, {String? baseUrl}) = _CustomersClient;

  /// Register Customer.
  ///
  /// Register a customer. Use the `/auth/customer/emailpass/register` API route first to retrieve the registration token and pass it in the header of the request.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/customers')
  Future<StoreCustomerResponse> postCustomers({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCreateCustomer body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Get Logged-in Customer.
  ///
  /// Retrieve the logged-in customer. You can expand the customer's relations or select the fields that should be returned.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields. This API route restricts the fields that can be selected. Learn how to override the retrievable fields in the [Retrieve Custom Links](https://docs.medusajs.com/learn/fundamentals/api-routes/retrieve-custom-links) documentation.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/customers/me')
  Future<StoreCustomerResponse> getCustomersMe({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Update Customer.
  ///
  /// Update the logged-in customer's details.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/customers/me')
  Future<StoreCustomerResponse> postCustomersMe({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreUpdateCustomer body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// List Customer's Addresses.
  ///
  /// Retrieve the addresses of the logged-in customer. The addresses can be filtered by fields such as `country_code`. The addresses can also be sorted or paginated.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [city] - Filter by the address's city.
  ///
  /// [postalCode] - Filter by the address's postal code.
  ///
  /// [countryCode] - Filter by the address's country code.
  ///
  /// [q] - Search term to filter the address's searchable properties.
  ///
  /// [and] - Join query parameters with an AND condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [or] - Join query parameters with an OR condition. Each object's content is the same type as the expected query parameters.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [limit] - Limit the number of items returned in the list.
  ///
  /// [offset] - The number of items to skip when retrieving a list.
  ///
  /// [order] - The field to sort the data by. By default, the sort order is ascending. To change the order to descending, prefix the field name with `-`.
  ///
  /// [withDeleted] - The customer's with deleted.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. If a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. Without prefix it will replace the entire default fields.
  @GET('/store/customers/me/addresses')
  Future<StoreCustomerAddressListResponse> getCustomersMeAddresses({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('city') dynamic city,
    @Query('postal_code') dynamic postalCode,
    @Query('country_code') dynamic countryCode,
    @Query('q') String? q,
    @Query(r'$and') List<dynamic>? and,
    @Query(r'$or') List<dynamic>? or,
    @Query('locale') String? locale,
    @Query('limit') num? limit,
    @Query('offset') num? offset,
    @Query('order') String? order,
    @Query('with_deleted') bool? withDeleted,
    @Query('fields') String? fields,
  });

  /// Create Address for Logged-In Customer.
  ///
  /// Create an address for the logged-in customer.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields. This API route restricts the fields that can be selected. Learn how to override the retrievable fields in the [Retrieve Custom Links](https://docs.medusajs.com/learn/fundamentals/api-routes/retrieve-custom-links) documentation.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/customers/me/addresses')
  Future<StoreCustomerResponse> postCustomersMeAddresses({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCreateCustomerAddress body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Get Customer's Address.
  ///
  /// Retrieve an address of the logged-in customer. You can expand the address's relations or select the fields that should be returned.
  ///
  /// [addressId] - The address's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields. This API route restricts the fields that can be selected. Learn how to override the retrievable fields in the [Retrieve Custom Links](https://docs.medusajs.com/learn/fundamentals/api-routes/retrieve-custom-links) documentation.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/customers/me/addresses/{address_id}')
  Future<StoreCustomerAddressResponse> getCustomersMeAddressesAddressId({
    @Path('address_id') required String addressId,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Update Customer's Address.
  ///
  /// Update the logged-in customer's address.
  ///
  /// [addressId] - The address's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields. This API route restricts the fields that can be selected. Learn how to override the retrievable fields in the [Retrieve Custom Links](https://docs.medusajs.com/learn/fundamentals/api-routes/retrieve-custom-links) documentation.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @POST('/store/customers/me/addresses/{address_id}')
  Future<StoreCustomerResponse> postCustomersMeAddressesAddressId({
    @Path('address_id') required String addressId,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreUpdateCustomerAddress body,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });

  /// Remove Customer's Address.
  ///
  /// Remove an address of the logged-in customer.
  ///
  /// [addressId] - The address's ID.
  ///
  /// [xPublishableApiKey] - Publishable API Key created in the Medusa Admin.
  ///
  /// [xMedusaLocale] - The locale in BCP 47 format to retrieve localized content.
  ///
  /// [fields] - Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default fields. without prefix it will replace the entire default fields. This API route restricts the fields that can be selected. Learn how to override the retrievable fields in the [Retrieve Custom Links](https://docs.medusajs.com/learn/fundamentals/api-routes/retrieve-custom-links) documentation.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @DELETE('/store/customers/me/addresses/{address_id}')
  Future<DeleteStoreCustomersMeAddressesAddressIdResponse>
  deleteCustomersMeAddressesAddressId({
    @Path('address_id') required String addressId,
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('locale') String? locale,
  });
}
