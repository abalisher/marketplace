// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_delivery_tariff.g.dart';

@JsonSerializable()
class AdminDeliveryTariff {
  const AdminDeliveryTariff({
    required this.id,
    required this.zone,
    required this.basePrice,
    required this.pricePerKg,
    required this.pricePerM3,
    required this.active,
  });

  factory AdminDeliveryTariff.fromJson(Map<String, Object?> json) =>
      _$AdminDeliveryTariffFromJson(json);

  final String id;
  final String zone;
  @JsonKey(name: 'base_price')
  final num basePrice;
  @JsonKey(name: 'price_per_kg')
  final num pricePerKg;
  @JsonKey(name: 'price_per_m3')
  final num pricePerM3;
  final bool active;

  Map<String, Object?> toJson() => _$AdminDeliveryTariffToJson(this);
}
