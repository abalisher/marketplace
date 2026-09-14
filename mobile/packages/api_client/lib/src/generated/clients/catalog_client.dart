// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/admin_apply_price_stock_req.dart';
import '../models/admin_apply_price_stock_res.dart';
import '../models/admin_import_price_stock_req.dart';
import '../models/admin_price_stock_history_res.dart';
import '../models/admin_price_stock_import_res.dart';
import '../models/admin_price_stock_res.dart';
import '../models/category.dart';
import '../models/status.dart';
import '../models/stock.dart';
import '../models/store_product_alternatives_res.dart';
import '../models/store_product_availability_res.dart';

part 'catalog_client.g.dart';

@RestApi()
abstract class CatalogClient {
  factory CatalogClient(Dio dio, {String? baseUrl}) = _CatalogClient;

  /// List Prices And Stock.
  ///
  /// Срез экрана «Цены и остатки»: цена и остаток одной таблицей, без ядровой цепочки «вариант → price set → цена» и «inventory item → level → остаток». Строка — покупаемый вариант товара; поиск идёт по названию товара и по артикулу, фильтр — по одной из четырёх категорий каталога. «Мало» и «нет в наличии» считаются от СВОБОДНОГО остатка (лежит минус зарезервировано), поэтому срез читается до потолка scan_cap и режется на страницы в памяти, а счётчики чипов остаются полными.
  ///
  /// [q] - Поиск по названию товара или артикулу варианта.
  ///
  /// [category] - Ограничить срез одной категорией каталога (handle) либо мешком «вне ассортимента» (other: категория вне четвёрки или её нет).
  ///
  /// [stock] - Чип остатка: zero — нечего продавать, low — на исходе (порог в ответе, low_threshold).
  ///
  /// [locationId] - Склад, который смотрит экран: остаток и резерв в строках — его. У магазина с одним складом параметр не нужен — срез берёт единственный. Без разреза при нескольких складах строка показывает сумму, и правка остатка требует назвать склад.
  ///
  /// [status] - Статус товара. По умолчанию — все: цену назначают и до публикации.
  @GET('/admin/price-stock')
  Future<AdminPriceStockRes> getPriceStock({
    @Query('limit') int? limit = 50,
    @Query('offset') int? offset = 0,
    @Query('q') String? q,
    @Query('category') Category? category,
    @Query('stock') Stock? stock,
    @Query('location_id') String? locationId,
    @Query('status') Status? status,
  });

  /// Apply Price And Stock Changes.
  ///
  /// Партия правок цены и остатка. Правка прямо в строке — партия из одной позиции, массовая правка выделенных — из нескольких: путь записи один. Партия применяется целиком либо не применяется вовсе: сначала все правки сверяются с текущим состоянием каталога, и при первой негодной приходит 400 со списком проблемных позиций (по строке, с названием). Правки, где число совпало с текущим, не пишутся ни в ядро, ни в журнал (skipped). Остаток задаётся абсолютным числом; склад можно не называть, если позиция лежит на одном.
  @POST('/admin/price-stock')
  Future<AdminApplyPriceStockRes> postPriceStock({
    @Body() required AdminApplyPriceStockReq body,
  });

  /// List Price And Stock Changes.
  ///
  /// Журнал правок цены и остатка: кто, когда, было → стало. Ядро истории не хранит (price set перезаписывается, уровень остатка знает только текущее число), поэтому факт правки пишется отдельно. Без фильтра — лента экрана, с variant_id — история одной позиции.
  ///
  /// [variantId] - История одной позиции каталога.
  @GET('/admin/price-stock/history')
  Future<AdminPriceStockHistoryRes> getPriceStockHistory({
    @Query('limit') int? limit = 20,
    @Query('offset') int? offset = 0,
    @Query('variant_id') String? variantId,
  });

  /// Export Prices And Stock.
  ///
  /// Выгрузка среза экрана «Цены и остатки» файлом CSV: тот же склад, поиск и чипы, что на экране, но ЦЕЛИКОМ, а не страницей. Разделитель «;» и BOM — так файл открывает русский Excel двойным щелчком; ключ строки — артикул, технических id в файле нет. Правленый файл возвращается через POST /admin/price-stock/import.
  ///
  /// [q] - Поиск по названию товара или артикулу варианта.
  ///
  /// [category] - Ограничить срез одной категорией каталога (handle) либо мешком «вне ассортимента» (other: категория вне четвёрки или её нет).
  ///
  /// [stock] - Чип остатка: zero — нечего продавать, low — на исходе (порог в ответе, low_threshold).
  ///
  /// [locationId] - Склад, который смотрит экран: остаток и резерв в строках — его. У магазина с одним складом параметр не нужен — срез берёт единственный. Без разреза при нескольких складах строка показывает сумму, и правка остатка требует назвать склад.
  ///
  /// [status] - Статус товара. По умолчанию — все: цену назначают и до публикации.
  @GET('/admin/price-stock/export')
  Future<String> exportPriceStock({
    @Query('q') String? q,
    @Query('category') Category? category,
    @Query('stock') Stock? stock,
    @Query('location_id') String? locationId,
    @Query('status') Status? status,
  });

  /// Preview Prices And Stock Import.
  ///
  /// ПРЕДПРОСМОТР загруженного файла: что именно поменяется, если применить. Ресурс ничего не пишет — он сверяет строки файла с каталогом по артикулу и отдаёт готовую партию, которую применяет POST /admin/price-stock с source=import (путь записи один, партия по-прежнему пишется целиком либо не пишется вовсе). Файл принимается в UTF-8 (с BOM и без), windows-1251 и UTF-16; разделитель определяется сам. Строку, которую принять нельзя, ресурс называет номером в файле.
  @POST('/admin/price-stock/import')
  Future<AdminPriceStockImportRes> previewPriceStockImport({
    @Body() required AdminImportPriceStockReq body,
  });

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
