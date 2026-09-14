// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_price_change_source.dart';

part 'admin_price_change.g.dart';

/// Запись журнала: было → стало. Пустая пара значит «не трогали» — правка одной цены оставляет остаток пустым.
@JsonSerializable()
class AdminPriceChange {
  const AdminPriceChange({
    required this.id,
    required this.variantId,
    required this.productTitle,
    required this.source,
    required this.createdAt,
    this.variantTitle,
    this.sku,
    this.currencyCode,
    this.oldPrice,
    this.newPrice,
    this.oldStock,
    this.newStock,
    this.locationId,
    this.locationName,
    this.changedByName,
  });

  factory AdminPriceChange.fromJson(Map<String, Object?> json) =>
      _$AdminPriceChangeFromJson(json);

  final String id;
  @JsonKey(name: 'variant_id')
  final String variantId;
  @JsonKey(name: 'product_title')
  final String productTitle;
  @JsonKey(name: 'variant_title')
  final String? variantTitle;
  final String? sku;
  @JsonKey(name: 'currency_code')
  final String? currencyCode;
  @JsonKey(name: 'old_price')
  final num? oldPrice;
  @JsonKey(name: 'new_price')
  final num? newPrice;
  @JsonKey(name: 'old_stock')
  final num? oldStock;
  @JsonKey(name: 'new_stock')
  final num? newStock;

  /// Склад правки остатка; у правки цены склада нет (цена в магазине одна).
  @JsonKey(name: 'location_id')
  final String? locationId;

  /// Название склада правки; null — склада больше нет в магазине.
  @JsonKey(name: 'location_name')
  final String? locationName;

  /// Кто правил — имя учётки на момент правки; у учётки без имени — логин из почты без домена.
  @JsonKey(name: 'changed_by_name')
  final String? changedByName;
  final AdminPriceChangeSource source;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  Map<String, Object?> toJson() => _$AdminPriceChangeToJson(this);
}
