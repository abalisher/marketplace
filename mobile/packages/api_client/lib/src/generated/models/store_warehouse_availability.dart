// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'store_warehouse_availability.g.dart';

@JsonSerializable()
class StoreWarehouseAvailability {
  const StoreWarehouseAvailability({
    required this.id,
    required this.name,
    required this.available,
  });

  factory StoreWarehouseAvailability.fromJson(Map<String, Object?> json) =>
      _$StoreWarehouseAvailabilityFromJson(json);

  /// Id склада (stock location).
  final String id;
  final String name;
  final num available;

  Map<String, Object?> toJson() => _$StoreWarehouseAvailabilityToJson(this);
}
