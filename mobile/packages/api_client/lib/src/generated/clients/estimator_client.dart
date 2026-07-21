// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/store_create_estimate.dart';
import '../models/store_estimate_res.dart';
import '../models/store_estimate_suggestions_res.dart';

part 'estimator_client.g.dart';

@RestApi()
abstract class EstimatorClient {
  factory EstimatorClient(Dio dio, {String? baseUrl}) = _EstimatorClient;

  /// Create Material Estimate.
  ///
  /// Расчёт материалов по ручным параметрам и нормативной базе (MVP; ИИ-распознавание файлов/голоса — отдельный этап). Результат рекомендательный. Гость допускается.
  @POST('/store/estimates')
  Future<StoreEstimateRes> postEstimates({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Body() required StoreCreateEstimate body,
  });

  /// Get Material Estimate.
  ///
  /// Расчёт с позициями по id.
  @GET('/store/estimates/{id}')
  Future<StoreEstimateRes> getEstimatesId({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
  });

  /// Get Estimate Suggestions.
  ///
  /// Подборка товаров под каждую позицию расчёта в 3 сегментах (эконом/комфорт/бизнес) с ценой, итогом и наличием. Позиции без категории норматива — без опций.
  ///
  /// [currencyCode] - Валюта цен подборки (по умолчанию kzt).
  @GET('/store/estimates/{id}/suggestions')
  Future<StoreEstimateSuggestionsRes> getEstimatesIdSuggestions({
    @Header('x-publishable-api-key') required String xPublishableApiKey,
    @Path('id') required String id,
    @Query('currency_code') String? currencyCode,
  });
}
