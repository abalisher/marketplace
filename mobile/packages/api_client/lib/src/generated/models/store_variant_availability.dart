// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'store_city_availability.dart';

part 'store_variant_availability.g.dart';

@JsonSerializable()
class StoreVariantAvailability {
  const StoreVariantAvailability({
    required this.id,
    required this.cities,
    this.title,
    this.sku,
  });

  factory StoreVariantAvailability.fromJson(Map<String, Object?> json) =>
      _$StoreVariantAvailabilityFromJson(json);

  final String id;
  final String? title;
  final String? sku;
  final List<StoreCityAvailability> cities;

  Map<String, Object?> toJson() => _$StoreVariantAvailabilityToJson(this);
}
