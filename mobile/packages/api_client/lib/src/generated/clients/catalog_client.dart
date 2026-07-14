// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_product_alternatives_res.dart';
import '../models/store_product_availability_res.dart';

part 'catalog_client.g.dart';

@RestApi()
abstract class CatalogClient {
  factory CatalogClient(Dio dio, {String? baseUrl}) = _CatalogClient;

  /// Get Product Availability by City and Warehouse.
  ///
  /// Остатки опубликованного товара в разрезе город → склад. available = stocked - reserved. 404 — товар не найден или не опубликован.
  @GET('/store/products/{id}/availability')
  Future<StoreProductAvailabilityRes> getProductsIdAvailability({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
  });

  /// List Product Alternatives.
  ///
  /// Подбор альтернатив: опубликованные товары той же категории и того же сегмента, исключая сам товар. 404 — товар не найден или не опубликован.
  ///
  /// [limit] - Размер выдачи (1–20, по умолчанию 5).
  @GET('/store/products/{id}/alternatives')
  Future<StoreProductAlternativesRes> getProductsIdAlternatives({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
    @Query('limit') int? limit = 5,
  });
}
