// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_price_stock_change.g.dart';

/// Одна правка. Отсутствие поля — «не трогали»; цена и остаток — целые числа.
@JsonSerializable()
class AdminPriceStockChange {
  const AdminPriceStockChange({
    required this.variantId,
    this.price,
    this.stock,
    this.locationId,
  });

  factory AdminPriceStockChange.fromJson(Map<String, Object?> json) =>
      _$AdminPriceStockChangeFromJson(json);

  @JsonKey(name: 'variant_id')
  final String variantId;
  final int? price;

  /// Абсолютный остаток на складе, а не изменение.
  final int? stock;

  /// Обязателен, если позиция лежит на нескольких складах или ни на одном.
  @JsonKey(name: 'location_id')
  final String? locationId;

  Map<String, Object?> toJson() => _$AdminPriceStockChangeToJson(this);
}
