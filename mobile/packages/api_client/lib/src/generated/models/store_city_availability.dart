// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_warehouse_availability.dart';

part 'store_city_availability.g.dart';

@JsonSerializable()
class StoreCityAvailability {
  const StoreCityAvailability({
    required this.available,
    required this.stockLocations,
    this.city,
  });

  factory StoreCityAvailability.fromJson(Map<String, Object?> json) =>
      _$StoreCityAvailabilityFromJson(json);

  /// Город склада (stock_location.address.city); null — адрес без города.
  final String? city;
  final num available;
  @JsonKey(name: 'stock_locations')
  final List<StoreWarehouseAvailability> stockLocations;

  Map<String, Object?> toJson() => _$StoreCityAvailabilityToJson(this);
}
