// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_delivery_tariff.dart';

part 'admin_tariff_res.g.dart';

@JsonSerializable()
class AdminTariffRes {
  const AdminTariffRes({required this.tariff});

  factory AdminTariffRes.fromJson(Map<String, Object?> json) =>
      _$AdminTariffResFromJson(json);

  final AdminDeliveryTariff tariff;

  Map<String, Object?> toJson() => _$AdminTariffResToJson(this);
}
