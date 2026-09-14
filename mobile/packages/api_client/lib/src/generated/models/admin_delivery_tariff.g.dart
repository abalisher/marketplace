// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_delivery_tariff.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminDeliveryTariff _$AdminDeliveryTariffFromJson(Map<String, dynamic> json) =>
    AdminDeliveryTariff(
      id: json['id'] as String,
      zone: json['zone'] as String,
      basePrice: json['base_price'] as num,
      pricePerKg: json['price_per_kg'] as num,
      pricePerM3: json['price_per_m3'] as num,
      active: json['active'] as bool,
    );

Map<String, dynamic> _$AdminDeliveryTariffToJson(
  AdminDeliveryTariff instance,
) => <String, dynamic>{
  'id': instance.id,
  'zone': instance.zone,
  'base_price': instance.basePrice,
  'price_per_kg': instance.pricePerKg,
  'price_per_m3': instance.pricePerM3,
  'active': instance.active,
};
