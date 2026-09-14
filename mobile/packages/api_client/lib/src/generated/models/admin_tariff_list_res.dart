// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

import 'admin_delivery_tariff.dart';

part 'admin_tariff_list_res.g.dart';

@JsonSerializable()
class AdminTariffListRes {
  const AdminTariffListRes({required this.tariffs});

  factory AdminTariffListRes.fromJson(Map<String, Object?> json) =>
      _$AdminTariffListResFromJson(json);

  final List<AdminDeliveryTariff> tariffs;

  Map<String, Object?> toJson() => _$AdminTariffListResToJson(this);
}
