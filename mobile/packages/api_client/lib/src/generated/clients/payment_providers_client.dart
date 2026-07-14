// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/get_store_payment_providers_response.dart';

part 'payment_providers_client.g.dart';

@RestApi()
abstract class PaymentProvidersClient {
  factory PaymentProvidersClient(Dio dio, {String? baseUrl}) =
      _PaymentProvidersClient;

  /// List Payment Providers.
  ///
  /// Retrieve a list of payment providers. You must provide the `region_id` query parameter to retrieve the payment providers enabled in that region.
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
  /// [regionId] - Filter by a region ID to get the payment providers enabled in that region.
  ///
  /// [withDeleted] - Whether to include deleted records in the result.
  ///
  /// [locale] - The locale in BCP 47 format to retrieve localized content.
  @GET('/store/payment-providers')
  Future<GetStorePaymentProvidersResponse> getPaymentProviders({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Query('region_id') required String regionId,
    @Header('x-medusa-locale') String? xMedusaLocale,
    @Query('fields') String? fields,
    @Query('offset') num? offset,
    @Query('limit') num? limit,
    @Query('order') String? order,
    @Query('with_deleted') bool? withDeleted,
    @Query('locale') String? locale,
  });
}
