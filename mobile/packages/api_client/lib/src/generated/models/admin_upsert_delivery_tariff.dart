// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'admin_upsert_delivery_tariff.g.dart';

@JsonSerializable()
class AdminUpsertDeliveryTariff {
  const AdminUpsertDeliveryTariff({
    required this.zone,
    required this.basePrice,
    required this.pricePerKg,
    required this.pricePerM3,
    this.active,
  });

  factory AdminUpsertDeliveryTariff.fromJson(Map<String, Object?> json) =>
      _$AdminUpsertDeliveryTariffFromJson(json);

  final String zone;
  @JsonKey(name: 'base_price')
  final num basePrice;
  @JsonKey(name: 'price_per_kg')
  final num pricePerKg;
  @JsonKey(name: 'price_per_m3')
  final num pricePerM3;
  final bool? active;

  Map<String, Object?> toJson() => _$AdminUpsertDeliveryTariffToJson(this);
}
