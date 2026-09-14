// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_tariff_list_res.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminTariffListRes _$AdminTariffListResFromJson(Map<String, dynamic> json) =>
    AdminTariffListRes(
      tariffs: (json['tariffs'] as List<dynamic>)
          .map((e) => AdminDeliveryTariff.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AdminTariffListResToJson(AdminTariffListRes instance) =>
    <String, dynamic>{'tariffs': instance.tariffs};
