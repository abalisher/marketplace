// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_city_availability.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

StoreCityAvailability _$StoreCityAvailabilityFromJson(
  Map<String, dynamic> json,
) => StoreCityAvailability(
  available: json['available'] as num,
  stockLocations: (json['stock_locations'] as List<dynamic>)
      .map(
        (e) => StoreWarehouseAvailability.fromJson(e as Map<String, dynamic>),
      )
      .toList(),
  city: json['city'] as String?,
);

Map<String, dynamic> _$StoreCityAvailabilityToJson(
  StoreCityAvailability instance,
) => <String, dynamic>{
  'city': instance.city,
  'available': instance.available,
  'stock_locations': instance.stockLocations,
};
