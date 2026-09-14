// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_price_stock_row.g.dart';

/// Строка экрана «Цены и остатки» — покупаемый вариант товара: цена, остаток и то, что вообще можно править.
@JsonSerializable()
class AdminPriceStockRow {
  const AdminPriceStockRow({
    required this.variantId,
    required this.productId,
    required this.title,
    required this.currencyCode,
    required this.stocked,
    required this.reserved,
    required this.available,
    required this.stockedTotal,
    required this.locationsCount,
    required this.stockEditable,
    required this.priceEditable,
    this.variantTitle,
    this.sku,
    this.unit,
    this.status,
    this.categoryHandle,
    this.categoryName,
    this.price,
    this.locationId,
    this.locationName,
  });

  factory AdminPriceStockRow.fromJson(Map<String, Object?> json) =>
      _$AdminPriceStockRowFromJson(json);

  @JsonKey(name: 'variant_id')
  final String variantId;
  @JsonKey(name: 'product_id')
  final String productId;

  /// Название товара.
  final String title;

  /// Вариант (фасовка, размер, цвет) — у односортных товаров не показывается.
  @JsonKey(name: 'variant_title')
  final String? variantTitle;
  final String? sku;

  /// Единица измерения из карточки товара (мешок, м², шт).
  final String? unit;
  final String? status;
  @JsonKey(name: 'category_handle')
  final String? categoryHandle;
  @JsonKey(name: 'category_name')
  final String? categoryName;

  /// Цена в рабочей валюте; null — цена ещё не назначена.
  final num? price;
  @JsonKey(name: 'currency_code')
  final String currencyCode;

  /// Сколько лежит на складах.
  final num stocked;

  /// Сколько зарезервировано под заказы.
  final num reserved;

  /// Свободный остаток: лежит минус зарезервировано.
  final num available;

  /// Сколько лежит на ВСЕХ складах — чтобы в разрезе одного было видно «9 из 49».
  @JsonKey(name: 'stocked_total')
  final num stockedTotal;

  /// Куда пишется правка остатка. null — позиция лежит на нескольких складах либо ни на одном: склад надо назвать в правке.
  @JsonKey(name: 'location_id')
  final String? locationId;
  @JsonKey(name: 'location_name')
  final String? locationName;
  @JsonKey(name: 'locations_count')
  final num locationsCount;

  /// Остаток можно править: он ведётся и у варианта одна складская позиция.
  @JsonKey(name: 'stock_editable')
  final bool stockEditable;

  /// Цену можно править здесь: она не задана правилами (регион, канал, количество).
  @JsonKey(name: 'price_editable')
  final bool priceEditable;

  Map<String, Object?> toJson() => _$AdminPriceStockRowToJson(this);
}
