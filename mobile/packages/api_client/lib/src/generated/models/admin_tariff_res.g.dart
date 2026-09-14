// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_tariff_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTariffRes _$AdminTariffResFromJson(Map<String, dynamic> json) =>
    AdminTariffRes(
      tariff: AdminDeliveryTariff.fromJson(
        json['tariff'] as Map<String, dynamic>,
      ),
    );

Map<String, dynamic> _$AdminTariffResToJson(AdminTariffRes instance) =>
    <String, dynamic>{'tariff': instance.tariff};
